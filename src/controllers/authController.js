const bcrypt = require("bcrypt");
const { AppDataSource } = require("../config/database");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");


const registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const userRepo = AppDataSource.getRepository(User);


        const existingUser = await userRepo.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists." });
        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = userRepo.create({ username, password: hashedPassword, role });
        await userRepo.save(newUser);

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Failed to register user", error });
    }
};


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const userRepo = AppDataSource.getRepository(User);


        const user = await userRepo.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }


        const token = generateToken({ id: user.id, username: user.username, role: user.role });
        res.json({ token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Failed to log in", error });
    }
};

module.exports = { registerUser, loginUser };
