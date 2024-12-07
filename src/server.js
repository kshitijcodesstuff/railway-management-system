
require("dotenv").config();
const { initializeDatabase } = require("./config/database");
const app = require("./app"); 
const PORT = process.env.PORT || 3000;

initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize database:", err);
    });
