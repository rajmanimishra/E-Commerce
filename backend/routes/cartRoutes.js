const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const CartItem = require("../schema/cartSchema");
const Product = require("../productSchema/productSchema");
const authMiddleware = require("../middleware/authmiddleware");

// ===============================
// ADD PRODUCT TO CART (⚡ Fast Atomic Upsert)
// ===============================
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const qty = Number(quantity);

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Product ID is required",
            });
        }

        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        // 1. प्रोडक्ट केवल जरूरी फील्ड्स के साथ चेक करें (.lean() से स्पीड 3x)
        const product = await Product.findById(productId).select("title price").lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const userId = req.user.userId || req.user.id;

        // 2. सिंगल एटॉमिक UPSERT: अलग से findOne + save करने की जरूरत नहीं
        const cartItem = await CartItem.findOneAndUpdate(
            { userId, productId },
            { $inc: { quantity: qty } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();

        return res.status(200).json({
            success: true,
            message: `${qty} ${product.title} added to cart`,
            cartItem,
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add to cart",
        });
    }
});

// ===============================
// GET USER CART (⚡ Fast Projection)
// ===============================
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const cartItems = await CartItem.find({ userId })
            .populate("productId", "title price image category")
            .lean();

        // अगर कोई प्रोडक्ट डेटाबेस से डिलीट हो चुका हो तो null हैंडलिंग
        const validCart = cartItems.filter(item => item.productId !== null);

        res.status(200).json({
            success: true,
            cart: validCart,
        });

    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch cart",
        });
    }
});

// ===============================
// UPDATE CART QUANTITY
// ===============================
router.put("/:productId", authMiddleware, async (req, res) => {
    try {
        const { productId } = req.params;
        const qty = Number(req.body.quantity);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
        }

        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        const userId = req.user.userId || req.user.id;

        // सिंगल ऑपरेशन में अपडेट और फ़ेच
        const cartItem = await CartItem.findOneAndUpdate(
            { userId, productId },
            { $set: { quantity: qty } },
            { new: true }
        ).lean();

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cartItem,
        });

    } catch (error) {
        console.error("Update quantity error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update quantity",
        });
    }
});

// ===============================
// REMOVE PRODUCT FROM CART
// ===============================
router.delete("/:productId", authMiddleware, async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
        }

        const userId = req.user.userId || req.user.id;

        const deletedItem = await CartItem.findOneAndDelete({
            userId,
            productId,
        }).lean();

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product removed from cart",
        });

    } catch (error) {
        console.error("Remove cart item error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to remove item",
        });
    }
});

module.exports = router;