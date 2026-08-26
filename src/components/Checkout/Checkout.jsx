import React, { useEffect, useState } from "react";
import { useCart } from "../CartContext/CartContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
    const {
        cartItems,
        cartTotal,
        fetchCart,
    } = useCart();

    const navigate = useNavigate();

    // ==========================================
    // CHECKOUT STEP
    // 1 = Delivery Details
    // 2 = Payment
    // ==========================================

    const [step, setStep] = useState(1);

    // ==========================================
    // DELIVERY DETAILS
    // ==========================================

    const [formData, setFormData] = useState({
        fullName: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        notes: "",
    });

    // ==========================================
    // COUPON
    // ==========================================

    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState("");

    // ==========================================
    // PAYMENT
    // ==========================================

    const [paymentMethod, setPaymentMethod] =
        useState("Cash on Delivery");

    // ==========================================
    // ORDER LOADING
    // ==========================================

    const [placingOrder, setPlacingOrder] =
        useState(false);

    // ==========================================
    // FETCH CART
    // ==========================================

    useEffect(() => {
        fetchCart();
    }, []);

    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ==========================================
    // CONTINUE TO PAYMENT
    // ==========================================

    const handleContinueToPayment = (e) => {
        e.preventDefault();

        if (
            !formData.fullName.trim() ||
            !formData.mobile.trim() ||
            !formData.address.trim() ||
            !formData.city.trim() ||
            !formData.state.trim() ||
            !formData.pincode.trim()
        ) {
            alert(
                "Please fill all required delivery details."
            );

            return;
        }

        // Move to payment page
        setStep(2);

        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ==========================================
    // APPLY COUPON
    // ==========================================

    const applyCoupon = () => {
        const code = coupon.trim().toUpperCase();

        if (code === "GROCIFY10") {
            const discountAmount = cartTotal * 0.10;

            setDiscount(discountAmount);

            setCouponMessage(
                "Coupon applied! 10% discount."
            );
        } else {
            setDiscount(0);

            setCouponMessage(
                "Invalid coupon code."
            );
        }
    };

    // ==========================================
    // FINAL TOTAL
    // ==========================================

    const finalTotal = Math.max(
        0,
        cartTotal - discount
    );

    // ==========================================
    // PLACE ORDER
    // ==========================================

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        // ======================================
        // CHECK LOGIN
        // ======================================

        if (!token) {
            alert("Please login first.");
            navigate("/login");
            return;
        }

        // ======================================
        // CHECK CART
        // ======================================

        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            navigate("/allproducts");
            return;
        }

        // ======================================
        // PREPARE ORDER ITEMS
        // ======================================

        const orderItems = cartItems.map((item) => {
            const product = item.productId;

            return {
                productId: product._id,
                title: product.title,
                price: product.price,
                quantity: item.quantity,
            };
        });

        // ======================================
        // ORDER DATA
        // ======================================

        const orderData = {
            items: orderItems,

            customer: formData,

            subtotal: cartTotal,

            discount: discount,

            totalAmount: finalTotal,

            coupon: coupon.trim().toUpperCase(),

            paymentMethod: paymentMethod,
        };

        try {
            setPlacingOrder(true);

            // ==================================
            // SEND ORDER TO BACKEND
            // ==================================

            const response = await fetch(
                "http://localhost:3000/api/orders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify(orderData),
                }
            );

            const data = await response.json();

            // ==================================
            // SUCCESS
            // ==================================

            if (response.ok && data.success) {
                alert(
                    "Order placed successfully! 🎉"
                );

                // Refresh cart
                await fetchCart();

                // Go home
                navigate("/");
            } else {
                alert(
                    data.message ||
                    "Failed to place order."
                );
            }
        } catch (error) {
            console.error(
                "Place order error:",
                error
            );

            alert(
                "Something went wrong while placing your order."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    // ==========================================
    // EMPTY CART
    // ==========================================

    if (cartItems.length === 0) {
        return (
            <section className="py-32">

                <div className="max-w-4xl mx-auto px-5 text-center">

                    <h1 className="text-3xl font-bold mb-4">
                        Your Cart is Empty
                    </h1>

                    <p className="text-gray-500 mb-6">
                        Add some products before proceeding
                        to checkout.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/allproducts")
                        }
                        className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600"
                    >
                        Continue Shopping
                    </button>

                </div>

            </section>
        );
    }

    // ==========================================
    // CHECKOUT
    // ==========================================

    return (
        <section className="py-32 bg-gray-50">

            <div className="max-w-6xl mx-auto px-5">

                {/* ==================================
                    CHECKOUT HEADER
                ================================== */}

                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
                    Checkout
                </h1>

                {/* ==================================
                    STEP INDICATOR
                ================================== */}

                <div className="flex items-center justify-center mb-10">

                    {/* STEP 1 */}

                    <div className="flex items-center">

                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-300 text-gray-600"
                                }`}
                        >
                            1
                        </div>

                        <span
                            className={`ml-2 font-semibold ${step >= 1
                                    ? "text-orange-500"
                                    : "text-gray-500"
                                }`}
                        >
                            Delivery
                        </span>

                    </div>

                    {/* LINE */}

                    <div
                        className={`w-20 md:w-32 h-1 mx-4 ${step === 2
                                ? "bg-orange-500"
                                : "bg-gray-300"
                            }`}
                    ></div>

                    {/* STEP 2 */}

                    <div className="flex items-center">

                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 2
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-300 text-gray-600"
                                }`}
                        >
                            2
                        </div>

                        <span
                            className={`ml-2 font-semibold ${step === 2
                                    ? "text-orange-500"
                                    : "text-gray-500"
                                }`}
                        >
                            Payment
                        </span>

                    </div>

                </div>

                {/* ==================================
                    STEP 1
                    DELIVERY DETAILS
                ================================== */}

                {step === 1 && (

                    <form
                        onSubmit={handleContinueToPayment}
                    >

                        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">

                            <h2 className="text-2xl font-bold mb-6">
                                Delivery Details
                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                {/* Full Name */}

                                <div>

                                    <label className="block font-medium mb-2">
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                    />

                                </div>

                                {/* Mobile */}

                                <div>

                                    <label className="block font-medium mb-2">
                                        Mobile Number *
                                    </label>

                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="Enter mobile number"
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                    />

                                </div>

                                {/* Address */}

                                <div className="md:col-span-2">

                                    <label className="block font-medium mb-2">
                                        Address *
                                    </label>

                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="House No, Street, Area"
                                        rows="3"
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                    />

                                </div>

                                {/* City */}

                                <div>

                                    <label className="block font-medium mb-2">
                                        City *
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                    />

                                </div>

                                {/* State */}

                                <div>

                                    <label className="block font-medium mb-2">
                                        State *
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Enter state"
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                    />

                                </div>

                                {/* Pincode */}

                                <div>

                                    <label className="block font-medium mb-2">
                                        Pincode *
                                    </label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="Enter pincode"
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                    />

                                </div>

                                {/* Notes */}

                                <div className="md:col-span-2">

                                    <label className="block font-medium mb-2">
                                        Delivery Instructions
                                    </label>

                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Example: Please call before delivery..."
                                        rows="3"
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                    />

                                </div>

                            </div>

                            {/* CONTINUE BUTTON */}

                            <div className="flex justify-end mt-8">

                                <button
                                    type="submit"
                                    className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition"
                                >
                                    Continue to Payment →
                                </button>

                            </div>

                        </div>

                    </form>
                )}

                {/* ==================================
                    STEP 2
                    PAYMENT
                ================================== */}

                {step === 2 && (

                    <form onSubmit={handlePlaceOrder}>

                        <div className="grid lg:grid-cols-3 gap-8">

                            {/* ==================================
                                PAYMENT SECTION
                            ================================== */}

                            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 md:p-8">

                                <h2 className="text-2xl font-bold mb-6">
                                    Payment Method
                                </h2>

                                {/* COD */}

                                <label
                                    className={`flex items-center gap-4 border rounded-xl p-5 cursor-pointer transition ${paymentMethod ===
                                            "Cash on Delivery"
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200"
                                        }`}
                                >

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Cash on Delivery"
                                        checked={
                                            paymentMethod ===
                                            "Cash on Delivery"
                                        }
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                        className="w-5 h-5"
                                    />

                                    <div>

                                        <h3 className="font-bold text-lg">
                                            Cash on Delivery
                                        </h3>

                                        <p className="text-gray-500 text-sm">
                                            Pay when your order is
                                            delivered.
                                        </p>

                                    </div>

                                </label>

                                {/* ONLINE PAYMENT */}

                                <label
                                    className={`flex items-center gap-4 border rounded-xl p-5 mt-4 cursor-pointer transition ${paymentMethod ===
                                            "Online Payment"
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200"
                                        }`}
                                >

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Online Payment"
                                        checked={
                                            paymentMethod ===
                                            "Online Payment"
                                        }
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                        className="w-5 h-5"
                                    />

                                    <div>

                                        <h3 className="font-bold text-lg">
                                            Online Payment
                                        </h3>

                                        <p className="text-gray-500 text-sm">
                                            Pay securely online.
                                        </p>

                                    </div>

                                </label>

                                {/* DELIVERY INFORMATION */}

                                <div className="mt-8 border-t pt-6">

                                    <h3 className="font-bold text-lg mb-4">
                                        Delivery Address
                                    </h3>

                                    <div className="bg-gray-50 rounded-lg p-4">

                                        <p className="font-semibold">
                                            {formData.fullName}
                                        </p>

                                        <p className="text-gray-600 mt-1">
                                            {formData.mobile}
                                        </p>

                                        <p className="text-gray-600 mt-1">
                                            {formData.address}
                                        </p>

                                        <p className="text-gray-600">
                                            {formData.city},{" "}
                                            {formData.state} -{" "}
                                            {formData.pincode}
                                        </p>

                                        {formData.notes && (
                                            <p className="text-gray-600 mt-2">
                                                <span className="font-medium">
                                                    Note:
                                                </span>{" "}
                                                {formData.notes}
                                            </p>
                                        )}

                                    </div>

                                    {/* BACK BUTTON */}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep(1);

                                            window.scrollTo({
                                                top: 0,
                                                behavior: "smooth",
                                            });
                                        }}
                                        className="mt-5 text-orange-500 font-semibold hover:text-orange-600"
                                    >
                                        ← Back to Delivery Details
                                    </button>

                                </div>

                            </div>

                            {/* ==================================
                                ORDER SUMMARY
                            ================================== */}

                            <div className="bg-white rounded-xl shadow-md p-6 h-fit">

                                <h2 className="text-2xl font-bold mb-6">
                                    Order Summary
                                </h2>

                                {/* PRODUCTS */}

                                <div className="space-y-4">

                                    {cartItems.map((item) => {

                                        const product =
                                            item.productId;

                                        return (
                                            <div
                                                key={item._id}
                                                className="flex justify-between items-center border-b pb-3"
                                            >

                                                <div>

                                                    <h3 className="font-semibold">
                                                        {product.title}
                                                    </h3>

                                                    <p className="text-sm text-gray-500">
                                                        ₹
                                                        {product.price}{" "}
                                                        ×{" "}
                                                        {item.quantity}
                                                    </p>

                                                </div>

                                                <p className="font-semibold">
                                                    ₹
                                                    {(
                                                        product.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </p>

                                            </div>
                                        );
                                    })}

                                </div>

                                {/* ==================================
                                    COUPON
                                ================================== */}

                                <div className="mt-6">

                                    <label className="font-semibold">
                                        Coupon Code
                                    </label>

                                    <div className="flex mt-2">

                                        <input
                                            type="text"
                                            value={coupon}
                                            onChange={(e) =>
                                                setCoupon(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="GROCIFY10"
                                            className="flex-1 border rounded-l-lg px-3 py-2 outline-none"
                                        />

                                        <button
                                            type="button"
                                            onClick={applyCoupon}
                                            className="bg-orange-500 text-white px-4 rounded-r-lg hover:bg-orange-600"
                                        >
                                            Apply
                                        </button>

                                    </div>

                                    {couponMessage && (
                                        <p className="text-sm mt-2 text-gray-600">
                                            {couponMessage}
                                        </p>
                                    )}

                                </div>

                                {/* ==================================
                                    PRICE SUMMARY
                                ================================== */}

                                <div className="border-t mt-6 pt-5 space-y-3">

                                    <div className="flex justify-between">

                                        <span>
                                            Subtotal
                                        </span>

                                        <span>
                                            ₹
                                            {cartTotal.toFixed(2)}
                                        </span>

                                    </div>

                                    <div className="flex justify-between">

                                        <span>
                                            Discount
                                        </span>

                                        <span className="text-green-600">
                                            - ₹
                                            {discount.toFixed(2)}
                                        </span>

                                    </div>

                                    <div className="flex justify-between text-xl font-bold pt-3 border-t">

                                        <span>
                                            Total
                                        </span>

                                        <span className="text-orange-500">
                                            ₹
                                            {finalTotal.toFixed(2)}
                                        </span>

                                    </div>

                                </div>

                                {/* PLACE ORDER */}

                                <button
                                    type="submit"
                                    disabled={placingOrder}
                                    className="w-full mt-6 bg-orange-500 text-white py-3 rounded-full font-semibold text-lg hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {placingOrder
                                        ? "Placing Order..."
                                        : "Place Order"}
                                </button>

                            </div>

                        </div>

                    </form>
                )}

            </div>

        </section>
    );
};

export default Checkout;