const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const {
    registerUser,
    loginUser,
    getTrains,
    bookSeat,
    getBookingDetails,
} = require("../controllers/userController");

const router = express.Router();


router.post("/register", registerUser);


router.post("/login", loginUser);


router.get("/trains", authenticateUser, getTrains);


router.post("/book-seat", authenticateUser, bookSeat);


router.get("/bookings/:bookingId", authenticateUser, getBookingDetails);

module.exports = router;
