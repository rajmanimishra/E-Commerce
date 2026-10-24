const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Wishlist = require("../wishlistSchema/wishlistSchema");
const Product = require("../productSchema/productSchema");

const jwt = require("jsonwebtoken");

// 1. लाइटवेट Auth Middleware
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login."
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId || decoded.id; // टोकन पेलोड के अनुसार
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

// 2. Get Wishlist - lean() और चुनिंदा फील्ड्स के साथ (Fast Read)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const wishlist = await Wishlist.find({ userId: req.userId })
            .populate("productId", "title price image category")
            .lean();

        // यदि कोई प्रोडक्ट डेटाबेस से हट चुका हो तो null वाले आइटम्स को फ़िल्टर करें
        const sanitizedWishlist = wishlist.filter(item => item.productId !== null);

        res.status(200).json({
            success: true,
            wishlist: sanitizedWishlist
        });
    } catch (error) {
        console.error("Get wishlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist."
        });
    }
});

// 3. Add to Wishlist - Parallel Check और Direct Insert
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Product ID is required."
            });
        }

        // प्रोडक्ट का अस्तित्व और विशलिस्ट डुप्लीकेट दोनों एक साथ (Parallel) चेक करें
        const [productExists, alreadyExists] = await Promise.all([
            Product.findById(productId).select("_id title price").lean(),
            Wishlist.findOne({ userId: req.userId, productId }).select("_id").lean()
        ]);

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        if (alreadyExists) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist."
            });
        }

        // नया आइटम सेव करें
        const wishlistItem = await Wishlist.create({
            userId: req.userId,
            productId
        });

        res.status(201).json({
            success: true,
            message: `${productExists.title} added to wishlist.`,
            wishlistItem
        });

    } catch (error) {
        // MongoDB Duplicate Key Error (11000) हैंडलिंग
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist."
            });
        }

        console.error("Add wishlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add product to wishlist."
        });
    }
});

// 4. Remove from Wishlist
router.delete("/:productId", authMiddleware, async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID."
            });
        }

        const deletedItem = await Wishlist.findOneAndDelete({
            userId: req.userId,
            productId
        }).lean();

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist."
            });
        }

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist."
        });

    } catch (error) {
        console.error("Remove wishlist error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove product."
        });
    }
});

module.exports = router;