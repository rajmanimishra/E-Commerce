const express = require("express");
const router = express.Router();

const Product = require("../productSchema/productSchema");
// POST - Add a new product
router.post("/", async (req, res) => {
    try {
        const { title, price, image, category } = req.body;

        const product = await Product.create({
            title,
            price,
            image,
            category,
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add product",
            error: error.message,
        });
    }
});

// GET - Get all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
});

module.exports = router;