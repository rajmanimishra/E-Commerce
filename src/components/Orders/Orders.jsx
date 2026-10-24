
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductImage } from "../../utils/productImage";

// Product Images
import Banana from "../../assets/banana.webp";
import Tofu from "../../assets/tofu.webp";
import Yogurt from "../../assets/yogurt.webp";
import Slice_Cheese from "../../assets/slice-cheese.webp";
import Shrimp from "../../assets/shrimp.webp";
import Salmon from "../../assets/salmon.webp";
import RicottaCheese from "../../assets/ricotta-cheese.webp";
import Pineapple from "../../assets/pineapple.webp";
import Milk from "../../assets/milk.webp";
import Lettuce from "../../assets/lettuce.webp";
import Kiwi from "../../assets/kiwi.webp";
import Grapes from "../../assets/grapes.webp";
import Eggs from "../../assets/eggs.webp";
import Eggplant from "../../assets/eggplant.webp";
import Cheese from "../../assets/cheese.webp";
import Capsicum from "../../assets/capsicum.webp";
import Cabbage from "../../assets/cabbage.webp";
import Butter from "../../assets/butter.webp";
import Broccoli from "../../assets/broccoli.webp";
import Beef from "../../assets/beef.webp";

const API = "https://e-commerce-z6p4.onrender.com";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // MongoDB image filename -> React local asset
  const imageMap = {
    "banana.png": Banana,
    "tofu.png": Tofu,
    "yogurt.png": Yogurt,
    "slice-cheese.png": Slice_Cheese,
    "slice_cheese.png": Slice_Cheese,
    "shrimp.png": Shrimp,
    "salmon.png": Salmon,
    "ricotta-cheese.png": RicottaCheese,
    "ricottacheese.png": RicottaCheese,
    "pineapple.png": Pineapple,
    "milk.png": Milk,
    "lettuce.png": Lettuce,
    "kiwi.png": Kiwi,
    "grapes.png": Grapes,
    "eggs.png": Eggs,
    "eggplant.png": Eggplant,
    "cheese.png": Cheese,
    "capsicum.png": Capsicum,
    "cabbage.png": Cabbage,
    "butter.png": Butter,
    "broccoli.png": Broccoli,
    "beef.png": Beef,
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Placed":
        return "bg-blue-100 text-blue-700";
      case "Processing":
        return "bg-yellow-100 text-yellow-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-lg">Loading Orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <h2 className="text-3xl font-bold text-gray-700">
          No Orders Yet
        </h2>

        <button
          onClick={() => navigate("/allproducts")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-orange-500 mb-8">
        My Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="bg-orange-50 px-6 py-4 flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-semibold">{order._id.slice(-10)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <p className="font-semibold">
                  {order.paymentMethod === "ONLINE"
                    ? "Online"
                    : "Cash on Delivery"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold text-orange-600">
                  ₹{order.totalAmount}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4"
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={
                        getProductImage(item.productId?.image, imageMap) ||
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

                      <p className="text-orange-600 font-semibold">
                        ₹{item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-4 flex flex-wrap justify-between gap-4 items-center">
                <div className="space-y-1">
                  <p>
                    Payment Status:
                    <span
                      className={`ml-2 font-semibold ${order.paymentStatus === "Paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                        }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>

                  <p>
                    Delivery:
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/orders/${order._id}`)
                  }
                  className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-5 py-2 rounded-xl transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
