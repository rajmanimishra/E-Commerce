const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");
const crypto = require("crypto");

const authMiddleware = require("../middleware/authmiddleware");

const Order = require("../schema/orderSchema");
const CartItem = require("../schema/cartSchema");

// ======================================
// Razorpay Setup
// ======================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================
// CREATE RAZORPAY ORDER
// POST /api/orders/create-razorpay-order
// ======================================

router.post("/create-razorpay-order", authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount || req.body.totalAmount);

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured on the server.",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const payment = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      success: true,
      orderId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create payment",
      error: error.message,
    });
  }
});

// ======================================
// PLACE ORDER
// POST /api/orders
// ======================================

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
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

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

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session. Please login again.",
      });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.productId,
      title: String(item.title || "").trim(),
      price: Number(item.price),
      quantity: Number(item.quantity),
    }));

    const invalidItem = normalizedItems.find(
      (item) =>
        !item.productId ||
        !item.title ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    );

    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: "One or more cart items are invalid. Please refresh your cart and try again.",
      });
    }

    const orderTotal = Number(totalAmount);

    if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order total must be greater than zero.",
      });
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid payment method.",
      });
    }

    const order = await Order.create({
      userId: req.userId,
      items: normalizedItems,
      customer,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      totalAmount: orderTotal,
      coupon: coupon || "",
      paymentMethod,
      paymentStatus: paymentMethod === "ONLINE" ? "Paid" : "Pending",
      orderStatus: "Placed",
      razorpayOrderId: razorpayOrderId || "",
      razorpayPaymentId: razorpayPaymentId || "",
      razorpaySignature: razorpaySignature || "",
    });

    await CartItem.deleteMany({ userId: req.userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
});

// ======================================
// VERIFY PAYMENT
// POST /api/orders/verify-payment
// ======================================

router.post("/verify-payment", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing.",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret is not configured on the server.",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    res.json({
      success: true,
      message: "Payment verified",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });
  } catch (error) {
    console.error("Verification Error:", error);

    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
});

// ======================================
// GET MY ORDERS
// GET /api/orders
// ======================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate("items.productId", "title price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// ======================================
// GET SINGLE ORDER
// GET /api/orders/:id
// ======================================

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate("items.productId", "title price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Single Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

module.exports = router;
