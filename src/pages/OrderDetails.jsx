import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:3000";

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrder = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API}/api/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (data.success) {
                setOrder(data.order);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statusSteps = [
        "Placed",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                Loading...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center gap-4 mt-20">
                <h2 className="text-2xl font-bold">Order Not Found</h2>

                <button
                    onClick={() => navigate("/orders")}
                    className="bg-orange-500 text-white px-5 py-2 rounded-lg"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">

            <button
                onClick={() => navigate("/orders")}
                className="text-orange-500 mb-6"
            >
                ← Back to Orders
            </button>

            <div className="bg-white rounded-2xl shadow border overflow-hidden">

                <div className="bg-orange-50 p-6 flex justify-between flex-wrap gap-4">

                    <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-bold">{order._id}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-orange-600 font-bold text-xl">
                            ₹{order.totalAmount}
                        </p>
                    </div>

                </div>

                <div className="p-6 space-y-8">

                    <div>

                        <h2 className="text-xl font-bold mb-3">
                            Delivery Address
                        </h2>

                        <div className="bg-gray-50 rounded-xl p-4">

                            <p className="font-semibold">{order.customer.fullName}</p>

                            <p>{order.customer.mobile}</p>

                            <p>{order.customer.address}</p>

                            <p>
                                {order.customer.city}, {order.customer.state}
                            </p>

                            <p>{order.customer.pincode}</p>

                        </div>

                    </div>

                    <div>

                        <h2 className="text-xl font-bold mb-4">
                            Order Status
                        </h2>

                        <div className="flex flex-wrap gap-3">

                            {statusSteps.map((step) => {

                                const active =
                                    statusSteps.indexOf(step) <=
                                    statusSteps.indexOf(order.orderStatus);

                                return (
                                    <div
                                        key={step}
                                        className={`px-4 py-2 rounded-full text-sm font-medium ${active
                                                ? "bg-orange-500 text-white"
                                                : "bg-gray-200 text-gray-600"
                                            }`}
                                    >
                                        {step}
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                    <div>

                        <h2 className="text-xl font-bold mb-4">
                            Ordered Items
                        </h2>

                        <div className="space-y-4">

                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 border rounded-xl p-3"
                                >
                                    <img
                                        src={
                                            item.productId?.image ||
                                            "https://via.placeholder.com/80"
                                        }
                                        alt={item.title}
                                        className="w-20 h-20 rounded-lg object-cover border"
                                    />

                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.title}</h3>

                                        <p className="text-gray-500">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-bold text-orange-600">
                                        ₹{item.price}
                                    </p>
                                </div>
                            ))}

                        </div>

                    </div>

                    <div>

                        <h2 className="text-xl font-bold mb-3">
                            Payment Details
                        </h2>

                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">

                            <p>
                                Method:
                                <span className="font-semibold ml-2">
                                    {order.paymentMethod === "ONLINE"
                                        ? "Online Payment"
                                        : "Cash on Delivery"}
                                </span>
                            </p>

                            <p>
                                Status:
                                <span
                                    className={`ml-2 font-semibold ${order.paymentStatus === "Paid"
                                            ? "text-green-600"
                                            : "text-yellow-600"
                                        }`}
                                >
                                    {order.paymentStatus}
                                </span>
                            </p>

                            {order.razorpayPaymentId && (
                                <p className="break-all">
                                    Razorpay Payment ID:
                                    <span className="font-mono ml-2 text-sm">
                                        {order.razorpayPaymentId}
                                    </span>
                                </p>
                            )}

                        </div>

                    </div>

                    <div>

                        <h2 className="text-xl font-bold mb-3">
                            Bill Summary
                        </h2>

                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">

                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>- ₹{order.discount}</span>
                            </div>

                            <div className="flex justify-between font-bold text-lg border-t pt-3">
                                <span>Total</span>
                                <span className="text-orange-600">
                                    ₹{order.totalAmount}
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}