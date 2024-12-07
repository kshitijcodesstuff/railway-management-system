

const { AppDataSource } = require("../config/database");
const Train = require("../models/Train");
const Booking = require("../models/Booking");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { IsolationLevel } = require("typeorm"); 


const registerUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const userRepo = AppDataSource.getRepository(User);


        const existingUser = await userRepo.findOneBy({ username });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = userRepo.create({
            username,
            password: hashedPassword,
            role: "USER",
        });
        await userRepo.save(newUser);

        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const userRepo = AppDataSource.getRepository(User);


        const user = await userRepo.findOneBy({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password." });
        }


        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error("Error logging in user:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

const getTrains = async (req, res) => {
    const { sourceStation, destinationStation } = req.query;

    if (!sourceStation || !destinationStation) {
        return res.status(400).json({ message: "Source station and destination station are required." });
    }

    try {
        const trainRepo = AppDataSource.getRepository(Train);
        const trains = await trainRepo.find({
            where: { sourceStation, destinationStation },
        });

        if (trains.length === 0) {
            return res.status(404).json({ message: "No trains found for the given route." });
        }

        res.status(200).json({ trains });
    } catch (error) {
        console.error("Error fetching trains:", error.message);
        res.status(500).json({ message: "Failed to fetch trains.", error: error.message });
    }
};

const bookSeat = async (req, res) => {
    const { trainId, seatCount } = req.body;

    if (!trainId || !seatCount || seatCount <= 0) {
        return res.status(400).json({ message: "Train ID and a valid seat count are required." });
    }

    try {

        await AppDataSource.transaction("SERIALIZABLE", async (transactionalEntityManager) => {
            const trainRepo = transactionalEntityManager.getRepository("Train");
            const bookingRepo = transactionalEntityManager.getRepository("Booking");

            console.log("Attempting to fetch and lock train row for booking.");
            const train = await trainRepo
                .createQueryBuilder("train")
                .where("train.id = :id", { id: trainId })
                .setLock("pessimistic_write") 
                .getOne();

            if (!train) throw new Error("Train not found");
            console.log("Locked train row:", train);


            if (train.availableSeats < seatCount) {
                throw new Error("Insufficient seats available");
            }
            console.log("Sufficient seats available, proceeding with booking");


            train.availableSeats -= seatCount;
            await trainRepo.save(train);


            const booking = bookingRepo.create({
                user: req.user, 
                train,
                seatCount,
            });
            await bookingRepo.save(booking);

            console.log("Booking created:", booking);
            res.status(201).json({ message: "Booking successful.", booking });
        });
    } catch (error) {
        console.error("Error booking seat:", error.message);
        res.status(400).json({ message: "Failed to book seat.", error: error.message });
    }
};


// Get booking details
const getBookingDetails = async (req, res) => {
    const { bookingId } = req.params;

    if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required." });
    }

    try {
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({
            where: { id: bookingId },
            relations: ["user", "train"],
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        res.status(200).json({ booking });
    } catch (error) {
        console.error("Error fetching booking details:", error.message);
        res.status(500).json({ message: "Failed to fetch booking details.", error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getTrains,
    bookSeat,
    getBookingDetails,
};
