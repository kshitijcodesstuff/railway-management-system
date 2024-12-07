// src/tests/raceCondition.test.js

const request = require("supertest");
const { AppDataSource, initializeDatabase } = require("../config/database");
const app = require("../app");
require("dotenv").config();

let adminApiKey = process.env.ADMIN_API_KEY;
let userToken;
let server;

jest.setTimeout(30000);

describe("Race Condition Test", () => {
    beforeAll(async () => {
        // Initialize the database
        await initializeDatabase();

        // Start a test server
        server = app.listen(4000, () => {
            console.log("Test server running on port 4000");
        });

        // Use a unique username to avoid conflict with previous test runs
        const testUsername = `testuser_${Date.now()}`;

        // Register a new user
        await request(server)
            .post("/api/user/register")
            .send({ username: testUsername, password: "testpass" })
            .expect(201);

        // Login user
        const loginRes = await request(server)
            .post("/api/user/login")
            .send({ username: testUsername, password: "testpass" })
            .expect(200);

        userToken = loginRes.body.token;

        // Add a train (Admin)
        await request(server)
            .post("/api/admin/add-train")
            .set("x-api-key", adminApiKey)
            .send({
                trainName: "Test Express",
                sourceStation: "A",
                destinationStation: "B",
                totalSeats: 1,
            })
            .expect(201);
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        if (server) {
            server.close();
        }
    });

    test("Only one of the parallel booking requests should succeed", async () => {
        // Fetch train
        const trainsRes = await request(server)
            .get("/api/user/trains?sourceStation=A&destinationStation=B")
            .set("Authorization", `Bearer ${userToken}`)
            .expect(200);

        const trainId = trainsRes.body.trains[0].id;

        // Attempt two parallel bookings for the single seat
        const bookingRequests = [
            request(server)
                .post("/api/user/book-seat")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ trainId, seatCount: 1 }),
            request(server)
                .post("/api/user/book-seat")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ trainId, seatCount: 1 })
        ];

        const responses = await Promise.all(
            bookingRequests.map(p => p.catch(e => e))
        );

        const successCount = responses.filter(r => r && r.statusCode === 201).length;
        const failureCount = responses.filter(r => r && r.statusCode !== 201).length;

        expect(successCount).toBe(1);
        expect(failureCount).toBe(1);
    });
});
