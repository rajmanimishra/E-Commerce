
const mongoose = require("mongoose");
const dns = require("dns");

async function connectDB() {
    try {
        const dnsServers = process.env.MONGODB_DNS_SERVERS
            ? process.env.MONGODB_DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
            : ["1.1.1.1", "8.8.8.8"];

        dns.setServers(dnsServers);

        console.log("Connecting to MongoDB...");
        console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);

        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error.message);

        process.exit(1);
    }
}

module.exports = connectDB;
