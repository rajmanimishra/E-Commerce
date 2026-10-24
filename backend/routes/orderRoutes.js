const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const Order = require("../schema/orderSchema");
const CartItem = require("../schema/cartSchema");
const Product = require("../productSchema/productSchema");

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// सिग्नेचर वेरिफिकेशन हेल्पर
function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

const VALID_COUPON = "GROCIFY10";

async function calculateOrderAmounts(items, coupon) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Order must contain at least one product.");
    error.statusCode = 400;
    throw error;
  }

  if (items.some((item) =>
    !mongoose.Types.ObjectId.isValid(item?.productId) ||
    !Number.isInteger(Number(item.quantity)) ||
    Number(item.quantity) < 1
  )) {
    const error = new Error("Invalid product or quantity in cart.");
    error.statusCode = 400;
    throw error;
  }

  const productIds = items.map((item) => item.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds } })
    .select("title price")
    .lean();
  const productMap = new Map(dbProducts.map((product) => [product._id.toString(), product]));

  let subtotal = 0;
  const normalizedItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      const error = new Error("One or more products in your order do not exist.");
      error.statusCode = 400;
      throw error;
    }

    const quantity = Number(item.quantity);
    subtotal += product.price * quantity;
    normalizedItems.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity,
    });
  }

  subtotal = Math.round((subtotal + Number.EPSILON) * 100) / 100;
  const appliedCoupon =
    typeof coupon === "string" && coupon.trim().toUpperCase() === VALID_COUPON
      ? VALID_COUPON
      : "";
  const discount = appliedCoupon
    ? Math.round(subtotal * 0.1 * 100) / 100
    : 0;

  return {
    items: normalizedItems,
    subtotal,
    discount,
    totalAmount: Math.max(0, subtotal - discount),
    coupon: appliedCoupon,
  };
}

async function isCapturedPayment(orderId, paymentId, totalAmount) {
  const payment = await razorpay.payments.fetch(paymentId);
  return (
    payment.order_id === orderId &&
    payment.status === "captured" &&
    payment.amount === Math.round(totalAmount * 100) &&
    payment.currency === "INR"
  );
}

// ======================================
// 1. CREATE RAZORPAY ORDER
// POST /api/orders/create-razorpay-order
// ======================================
router.post("/create-razorpay-order", authMiddleware, async (req, res) => {
  try {
    const { items, coupon } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured on the server.",
      });
    }

    const amounts = await calculateOrderAmounts(items, coupon);

    if (amounts.totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid order amount is required.",
      });
    }

    const payment = await razorpay.orders.create({
      amount: Math.round(amounts.totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      success: true,
      orderId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      calculatedTotal: amounts.totalAmount,
      subtotal: amounts.subtotal,
      discount: amounts.discount,
      coupon: amounts.coupon,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to create payment order.",
    });
  }
});

router.post("/verify-payment", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required.",
      });
    }

    if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Tampered signature.",
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);
    if (
      payment.order_id !== orderId ||
      payment.status !== "captured" ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment has not been captured for this order.",
      });
    }

    return res.status(200).json({
      success: true,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });
  } catch (error) {
    console.error("Verify Razorpay Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
    });
  }
});

// ======================================
// 2. PLACE ORDER
// POST /api/orders
// ======================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      items,
      customer,
      coupon = "",
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product.",
      });
    }

    if (
      !customer ||
      !customer.fullName ||
      !customer.mobile ||
      !customer.address ||
      !customer.city ||
      !customer.state ||
      !customer.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery details are required.",
      });
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid payment method.",
      });
    }

    const amounts = await calculateOrderAmounts(items, coupon);

    if (paymentMethod === "ONLINE") {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: "Payment details missing for online transaction.",
        });
      }

      const isValidSignature = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed. Tampered signature.",
        });
      }

      if (!(await isCapturedPayment(razorpayOrderId, razorpayPaymentId, amounts.totalAmount))) {
        return res.status(400).json({
          success: false,
          message: "Payment details do not match the order.",
        });
      }
    }

    const order = await Order.create({
      userId: req.userId,
      items: amounts.items,
      customer,
      subtotal: amounts.subtotal,
      discount: amounts.discount,
      totalAmount: amounts.totalAmount,
      coupon: amounts.coupon,
      paymentMethod,
      paymentStatus: paymentMethod === "ONLINE" ? "Paid" : "Pending",
      orderStatus: "Placed",
      razorpayOrderId: razorpayOrderId || "",
      razorpayPaymentId: razorpayPaymentId || "",
      razorpaySignature: razorpaySignature || "",
    });

    // कार्ट को बैकग्राउंड में साफ़ करें
    await CartItem.deleteMany({ userId: req.userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Failed to place order",
    });
  }
});

// ======================================
// 3. GET USER ORDERS
// GET /api/orders
// ======================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate("items.productId", "title price image")
      .sort({ createdAt: -1 })
      .lean();

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
    });
  }
});

// ======================================
// 4. GET SINGLE ORDER
// GET /api/orders/:id
// ======================================
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID." });
  }

  try {
    const order = await Order.findOne({
      _id: id,
      userId: req.userId,
    })
      .populate("items.productId", "title price image")
      .lean();

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
    });
  }
});

// ======================================
// 5. ADMIN: GET ALL ORDERS
// GET /api/orders/admin/all
// ======================================
router.get("/admin/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "title price image")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load store orders.",
    });
  }
});

// ======================================
// 6. ADMIN: UPDATE STATUS
// PATCH /api/orders/:id/status
// ======================================
router.patch("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID." });
  }

  try {
    const allowedStatuses = [
      "Placed",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    const { orderStatus } = req.body;

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid order status.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { orderStatus } },
      { new: true, runValidators: true }
    ).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated.",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update order status.",
    });
  }
});

module.exports = router;