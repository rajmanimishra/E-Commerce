const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require('./db/db');
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running");
});
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
connectDB();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});