const { AppDataSource } = require("../config/database");
const Train = require("../models/Train");


const addTrain = async (req, res) => {
    const { trainName, sourceStation, destinationStation, totalSeats } = req.body;

    try {
        const trainRepo = AppDataSource.getRepository(Train);
        const newTrain = trainRepo.create({
            trainName,
            sourceStation,
            destinationStation,
            totalSeats,
            availableSeats: totalSeats,
        });
        await trainRepo.save(newTrain);

        res.status(201).json({ message: "Train added successfully!", train: newTrain });
    } catch (error) {
        console.error("Error adding train:", error);
        res.status(500).json({ message: "Failed to add train", error });
    }
};

module.exports = { addTrain };
