// app.js
const express = require("express");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

const app = express();

app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

module.exports = app; 