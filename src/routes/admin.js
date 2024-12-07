const express = require("express");
const { verifyAdmin } = require("../middleware/admin");
const { addTrain } = require("../controllers/adminController");

const router = express.Router();


router.post("/add-train", verifyAdmin, addTrain);

module.exports = router;
