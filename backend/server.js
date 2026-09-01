
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// ===============================
// Middleware
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);

// ===============================
// Home Route
// ===============================

app.get("/", (req, res) => {
    res.send("Backend is running");
});

// ===============================
// Connect MongoDB
// ===============================

connectDB();

// ===============================
// Port
// ===============================

const PORT = process.env.PORT || 3000;

// ===============================
// Start Server
// ===============================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

