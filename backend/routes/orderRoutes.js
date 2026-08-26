const express = require("express");
const router = express.Router();

const Order = require("../schema/orderSchema");
const Cart = require("../schema/cartSchema");
const jwt = require("jsonwebtoken");


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
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
        console.error("Auth error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};


// ==========================================
// PLACE ORDER
// POST /api/orders
// ==========================================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            items,
            customer,
            subtotal,
            discount,
            totalAmount,
            coupon,
            paymentMethod,
        } = req.body;


        // ======================================
        // VALIDATE ITEMS
        // ======================================

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order must contain at least one product",
            });
        }


        // ======================================
        // VALIDATE CUSTOMER
        // ======================================

        if (!customer) {
            return res.status(400).json({
                success: false,
                message: "Delivery details are required",
            });
        }

        if (
            !customer.fullName ||
            !customer.mobile ||
            !customer.address ||
            !customer.city ||
            !customer.state ||
            !customer.pincode
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all delivery details",
            });
        }


        // ======================================
        // VALIDATE PAYMENT
        // ======================================

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required",
            });
        }


        // ======================================
        // CREATE ORDER
        // ======================================

        const order = await Order.create({
            userId: req.userId,

            items: items,

            customer: customer,

            subtotal: Number(subtotal) || 0,

            discount: Number(discount) || 0,

            totalAmount: Number(totalAmount) || 0,

            coupon: coupon || "",

            paymentMethod: paymentMethod,

            paymentStatus: "Pending",

            orderStatus: "Pending",
        });


        // ======================================
        // CLEAR USER CART
        // ======================================

        await Cart.deleteMany({
            userId: req.userId,
        });


        // ======================================
        // RESPONSE
        // ======================================

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: order,
        });

    } catch (error) {
        console.error("Place order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to place order",
            error: error.message,
        });
    }
});


// ==========================================
// GET MY ORDERS
// GET /api/orders
// ==========================================

router.get("/", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.userId,
        })
            .populate(
                "items.productId",
                "title price image"
            )
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders,
        });

    } catch (error) {
        console.error("Get orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
});


// ==========================================
// GET SINGLE ORDER
// GET /api/orders/:id
// ==========================================

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.userId,
        }).populate(
            "items.productId",
            "title price image"
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            order: order,
        });

    } catch (error) {
        console.error("Get single order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch order",
            error: error.message,
        });
    }
});


module.exports = router;