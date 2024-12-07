const verifyAdmin = (req, res, next) => {
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== process.env.ADMIN_API_KEY) {
        res.status(403).json({ message: "Forbidden: Invalid API Key" });
        return;
    }

    next();
};

module.exports = { verifyAdmin };
