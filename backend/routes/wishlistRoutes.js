const express = require("express");
const router = express.Router();

const Wishlist = require("../wishlistSchema/wishlistSchema");
const Product = require("../productSchema/productSchema");


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login.",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};


// ==========================================
// GET USER WISHLIST
// ==========================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const wishlist = await Wishlist.find({
            userId: req.userId,
        }).populate("productId");

        res.status(200).json({
            success: true,
            wishlist,
        });

    } catch (error) {

        console.error("Get wishlist error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist.",
        });
    }
});


// ==========================================
// ADD TO WISHLIST
// ==========================================

router.post("/add", authMiddleware, async (req, res) => {

    try {

        const { productId } = req.body;

        if (!productId) {

            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }


        // Check product exists

        const product = await Product.findById(productId);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }


        // Check already exists

        const alreadyExists = await Wishlist.findOne({
            userId: req.userId,
            productId: productId,
        });

        if (alreadyExists) {

            return res.status(400).json({
                success: false,
                message: "Product already in wishlist.",
            });
        }


        // Create wishlist item

        const wishlistItem = await Wishlist.create({
            userId: req.userId,
            productId: productId,
        });


        res.status(201).json({
            success: true,
            message: "Product added to wishlist.",
            wishlistItem,
        });

    } catch (error) {

        console.error("Add wishlist error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add product to wishlist.",
        });
    }
});


// ==========================================
// REMOVE FROM WISHLIST
// ==========================================

router.delete("/:productId", authMiddleware, async (req, res) => {

    try {

        const { productId } = req.params;

        const deletedItem = await Wishlist.findOneAndDelete({
            userId: req.userId,
            productId: productId,
        });


        if (!deletedItem) {

            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist.",
            });
        }


        res.status(200).json({
            success: true,
            message: "Product removed from wishlist.",
        });

    } catch (error) {

        console.error("Remove wishlist error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove product.",
        });
    }
});


module.exports = router;