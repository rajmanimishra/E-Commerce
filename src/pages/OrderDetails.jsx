import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductImage } from "../utils/productImage";

const API = import.meta.env.VITE_API_URL || (
    import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://e-commerce-z6p4.onrender.com"
);

const statusSteps = [
    "Placed",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
];

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function fetchOrder() {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${API}/api/orders/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to load order details.");
                }

                if (isMounted && data.success && data.order) {
                    setOrder(data.order);
                } else {
                    throw new Error("Order not found.");
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Order fetch error:", err);
                    setError(err.message || "Unable to fetch order.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (id) {
            fetchOrder();
        }

        return () => {
            isMounted = false;
        };
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                <p className="text-sm font-medium text-stone-600">Loading order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="mx-auto mt-20 max-w-md text-center px-4">
                <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-stone-800">
                        {error || "Order Not Found"}
                    </h2>
                    <p className="mt-2 text-sm text-stone-600">
                        The requested order could not be retrieved. Please check the order ID and try again.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                        className="mt-6 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
                    >
                        Back to My Orders
                    </button>
                </div>
            </div>
        );
    }

    const isCancelled = order.orderStatus === "Cancelled";
    const currentStepIndex = statusSteps.indexOf(order.orderStatus);

    return (
        <main className="min-h-screen bg-stone-50 py-8">
            <div className="mx-auto max-w-5xl px-4">
                <button
                    type="button"
                    onClick={() => navigate("/orders")}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                    ← Back to Orders
                </button>

                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    {/* Order Summary Header */}
                    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-orange-50/50 p-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                                Order ID
                            </p>
                            <p className="font-mono text-base font-bold text-stone-900">
                                {order._id}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                                Placed On
                            </p>
                            <p className="text-sm font-medium text-stone-700">
                                {new Date(order.createdAt).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                                Total Amount
                            </p>
                            <p className="text-xl font-extrabold text-orange-600">
                                ₹{order.totalAmount}
                            </p>
                        </div>
                    </header>

                    <div className="space-y-8 p-6">
                        {/* Order Timeline / Status */}
                        <section aria-labelledby="order-status-heading">
                            <h2 id="order-status-heading" className="text-lg font-bold text-stone-900 mb-4">
                                Order Status
                            </h2>

                            {isCancelled ? (
                                <div className="inline-block rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-700 text-sm">
                                    This order has been cancelled.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {statusSteps.map((step, idx) => {
                                        const isActive = idx <= currentStepIndex;
                                        return (
                                            <div
                                                key={step}
                                                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${isActive
                                                        ? "bg-orange-600 text-white shadow-sm"
                                                        : "bg-stone-100 text-stone-500"
                                                    }`}
                                            >
                                                {step}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Delivery Address */}
                        <section aria-labelledby="delivery-address-heading">
                            <h2 id="delivery-address-heading" className="text-lg font-bold text-stone-900 mb-3">
                                Delivery Address
                            </h2>
                            <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 text-sm text-stone-700 leading-relaxed">
                                <p className="font-semibold text-stone-900">{order.customer?.fullName}</p>
                                <p className="text-stone-600">{order.customer?.mobile}</p>
                                <p className="mt-1">
                                    {order.customer?.address}, {order.customer?.city},{" "}
                                    {order.customer?.state} - {order.customer?.pincode}
                                </p>
                            </div>
                        </section>

                        {/* Ordered Items List */}
                        <section aria-labelledby="ordered-items-heading">
                            <h2 id="ordered-items-heading" className="text-lg font-bold text-stone-900 mb-4">
                                Items Ordered ({order.items?.length || 0})
                            </h2>
                            <div className="divide-y divide-stone-100 rounded-xl border border-stone-200">
                                {order.items?.map((item, index) => {
                                    const imageSrc =
                                        getProductImage(item.productId?.image || item.image) ||
                                        "https://placehold.co/80x80?text=Product";

                                    return (
                                        <div
                                            key={item.productId?._id || item._id || index}
                                            className="flex items-center gap-4 p-4"
                                        >
                                            <img
                                                loading="lazy"
                                                decoding="async"
                                                src={imageSrc}
                                                alt={item.title}
                                                className="h-16 w-16 flex-shrink-0 rounded-lg border border-stone-200 bg-white object-contain p-1"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-semibold text-stone-800">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-0.5 text-xs text-stone-500">
                                                    Qty: {item.quantity} × ₹{item.price}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold text-stone-900">
                                                ₹{item.price * item.quantity}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Payment & Bill Summary Grid */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Payment Information */}
                            <section aria-labelledby="payment-details-heading">
                                <h2 id="payment-details-heading" className="text-lg font-bold text-stone-900 mb-3">
                                    Payment Information
                                </h2>
                                <div className="space-y-2.5 rounded-xl border border-stone-200 bg-stone-50/60 p-4 text-sm text-stone-700">
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Method</span>
                                        <span className="font-semibold text-stone-800">
                                            {order.paymentMethod === "ONLINE" ? "Online Payment" : "Cash on Delivery"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Payment Status</span>
                                        <span
                                            className={`font-semibold ${order.paymentStatus === "Paid"
                                                    ? "text-green-700"
                                                    : "text-amber-700"
                                                }`}
                                        >
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                    {order.razorpayPaymentId && (
                                        <div className="border-t border-stone-200 pt-2 text-xs">
                                            <span className="text-stone-500 block">Transaction ID:</span>
                                            <span className="font-mono text-stone-800 break-all">
                                                {order.razorpayPaymentId}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Billing Summary */}
                            <section aria-labelledby="bill-summary-heading">
                                <h2 id="bill-summary-heading" className="text-lg font-bold text-stone-900 mb-3">
                                    Bill Summary
                                </h2>
                                <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50/60 p-4 text-sm">
                                    <div className="flex justify-between text-stone-600">
                                        <span>Subtotal</span>
                                        <span>₹{order.subtotal || order.totalAmount}</span>
                                    </div>

                                    {Number(order.discount) > 0 && (
                                        <div className="flex justify-between text-green-700">
                                            <span>Discount</span>
                                            <span>- ₹{order.discount}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-bold text-stone-900">
                                        <span>Grand Total</span>
                                        <span className="text-orange-600">₹{order.totalAmount}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}