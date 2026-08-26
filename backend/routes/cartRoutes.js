const express = require("express");
const router = express.Router();

const CartItem = require("../schema/cartSchema");
const Product = require("../productSchema/productSchema");
const authMiddleware = require("../middleware/authmiddleware");


// ===============================
// ADD PRODUCT TO CART
// ===============================
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const existingItem = await CartItem.findOne({
            userId: req.user.userId,
            productId: productId,
        });

        if (existingItem) {
            existingItem.quantity += Number(quantity);
            await existingItem.save();

            return res.status(200).json({
                success: true,
                message: "Product quantity updated in cart",
                cartItem: existingItem,
            });
        }

        const cartItem = await CartItem.create({
            userId: req.user.userId,
            productId: productId,
            quantity: Number(quantity),
        });

        res.status(201).json({
            success: true,
            message: "Product added to cart",
            cartItem,
        });

    } catch (error) {
        console.error("Add to cart error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// ===============================
// GET USER CART
// ===============================
router.get("/", authMiddleware, async (req, res) => {
    try {

        const cartItems = await CartItem.find({
            userId: req.user.userId,
        }).populate("productId");

        res.status(200).json({
            success: true,
            cart: cartItems,
        });

    } catch (error) {

        console.error("Get cart error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// ===============================
// UPDATE CART QUANTITY
// ===============================
router.put("/:productId", authMiddleware, async (req, res) => {
    try {

        const { productId } = req.params;
        const { quantity } = req.body;

        console.log("UPDATE CART");
        console.log("User:", req.user.userId);
        console.log("Product:", productId);
        console.log("Quantity:", quantity);

        if (!quantity || Number(quantity) < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        const cartItem = await CartItem.findOne({
            userId: req.user.userId,
            productId: productId,
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        cartItem.quantity = Number(quantity);

        await cartItem.save();

        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cartItem,
        });

    } catch (error) {

        console.error("Update quantity error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// ===============================
// REMOVE PRODUCT FROM CART
// ===============================
router.delete("/:productId", authMiddleware, async (req, res) => {
    try {

        const { productId } = req.params;

        const deletedItem = await CartItem.findOneAndDelete({
            userId: req.user.userId,
            productId: productId,
        });

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
            message: error.message,
        });
    }
});


module.exports = router;