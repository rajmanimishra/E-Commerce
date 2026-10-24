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

// ======================================
// 1. CREATE RAZORPAY ORDER
// POST /api/orders/create-razorpay-order
// ======================================
router.post("/create-razorpay-order", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured on the server.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required to generate order amount.",
      });
    }

    // ⚡ सिक्योरिटी: प्राइसेज को सीधे डेटाबेस से फेच करके सर्वर पर कैलकुलेट करें
    const productIds = items.map((i) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } })
      .select("price")
      .lean();

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p.price]));

    let calculatedTotal = 0;
    for (const item of items) {
      const price = productMap.get(item.productId);
      if (price === undefined) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your order do not exist.",
        });
      }
      calculatedTotal += price * Number(item.quantity || 1);
    }

    if (calculatedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid order amount is required.",
      });
    }

    const payment = await razorpay.orders.create({
      amount: Math.round(calculatedTotal * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      success: true,
      orderId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      calculatedTotal,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to create payment order.",
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
      discount = 0,
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

    // ⚡ ऑनलाइन पेमेंट वैलिडेशन (क्रिप्टोग्राफ़िक सिग्नेचर चेक)
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
    }

    // ⚡ डेटाबेस से प्रोडक्ट की सही कीमत और नाम लोड करें (Tamper-proof)
    const productIds = items.map((i) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } })
      .select("title price")
      .lean();

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    let subtotal = 0;
    const normalizedItems = [];

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      const qty = Number(item.quantity);

      if (!dbProduct || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity in cart.",
        });
      }

      subtotal += dbProduct.price * qty;
      normalizedItems.push({
        productId: dbProduct._id,
        title: dbProduct.title,
        price: dbProduct.price,
        quantity: qty,
      });
    }

    const appliedDiscount = Math.max(0, Number(discount) || 0);
    const finalAmount = Math.max(0, subtotal - appliedDiscount);

    const order = await Order.create({
      userId: req.userId,
      items: normalizedItems,
      customer,
      subtotal,
      discount: appliedDiscount,
      totalAmount: finalAmount,
      coupon,
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
    res.status(500).json({
      success: false,
      message: "Failed to place order",
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