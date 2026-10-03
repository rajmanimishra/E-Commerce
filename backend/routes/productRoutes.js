const express = require("express");
const router = express.Router();

const Product = require("../productSchema/productSchema");
const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

function isValidPrice(price) {
    return (
        (typeof price === "number" || (typeof price === "string" && price.trim() !== "")) &&
        Number.isFinite(Number(price)) &&
        Number(price) >= 0
    );
}

// POST - Add a new product
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, price, image, category } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof image !== "string" || !image.trim() ||
            typeof category !== "string" || !category.trim() ||
            !isValidPrice(price)
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a title, valid price, image, and category.",
            });
        }

        const product = await Product.create({
            title: title.trim(),
            price: Number(price),
            image: image.trim(),
            category: category.trim(),
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product,
        });
    } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add product",
        });
    }
});

// PUT - Update a product
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, price, image, category } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof image !== "string" || !image.trim() ||
            typeof category !== "string" || !category.trim() ||
            !isValidPrice(price)
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a title, valid price, image, and category.",
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                title: title.trim(),
                price: Number(price),
                image: image.trim(),
                category: category.trim(),
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            product,
        });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(error.name === "CastError" ? 400 : 500).json({
            success: false,
            message: error.name === "CastError" ? "Invalid product." : "Failed to update product.",
        });
    }
});

// DELETE - Remove a product
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product removed successfully.",
        });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(error.name === "CastError" ? 400 : 500).json({
            success: false,
            message: error.name === "CastError" ? "Invalid product." : "Failed to remove product.",
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
        console.error("Get Products Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
});

module.exports = router;