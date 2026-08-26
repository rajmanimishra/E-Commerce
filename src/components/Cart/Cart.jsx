import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Product Images
import Banana from "../../assets/banana.png";
import Tofu from "../../assets/tofu.png";
import Yogurt from "../../assets/yogurt.png";
import Slice_Cheese from "../../assets/slice-cheese.png";
import Shrimp from "../../assets/shrimp.png";
import Salmon from "../../assets/salmon.png";
import RicottaCheese from "../../assets/ricotta-cheese.png";
import Pineapple from "../../assets/pineapple.png";
import Milk from "../../assets/milk.png";
import Lettuce from "../../assets/lettuce.png";
import Kiwi from "../../assets/kiwi.png";
import Grapes from "../../assets/grapes.png";
import Eggs from "../../assets/eggs.png";
import Eggplant from "../../assets/eggplant.png";
import Cheese from "../../assets/cheese.png";
import Capsicum from "../../assets/capsicum.png";
import Cabbage from "../../assets/cabbage.png";
import Butter from "../../assets/butter.png";
import Broccoli from "../../assets/broccoli.png";
import Beef from "../../assets/beef.png";

const Cart = () => {

    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // ===============================
    // IMAGE MAP
    // ===============================

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

    // ===============================
    // FETCH CART
    // ===============================

    const fetchCart = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {

            const response = await fetch(
                "http://localhost:3000/api/cart",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                setCartItems(data.cart || []);
            } else {
                console.error(
                    data.message || "Unable to fetch cart"
                );
            }

        } catch (error) {

            console.error(
                "Error fetching cart:",
                error
            );

        } finally {

            setLoading(false);

        }
    };

    // ===============================
    // FETCH CART ON PAGE LOAD
    // ===============================

    useEffect(() => {
        fetchCart();
    }, []);

    // ===============================
    // UPDATE QUANTITY
    // ===============================

    const updateQuantity = async (
        productId,
        newQuantity
    ) => {

        if (newQuantity < 1) {
            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            navigate("/login");
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:3000/api/cart/${productId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        quantity: newQuantity,
                    }),
                }
            );

            const data =
                await response.json();

            if (data.success) {

                setCartItems(
                    (previousItems) =>
                        previousItems.map(
                            (item) => {

                                if (
                                    item.productId._id ===
                                    productId
                                ) {

                                    return {
                                        ...item,
                                        quantity:
                                            newQuantity,
                                    };

                                }

                                return item;
                            }
                        )
                );

            } else {

                alert(
                    data.message ||
                    "Unable to update quantity"
                );
            }

        } catch (error) {

            console.error(
                "Update quantity error:",
                error
            );

            alert(
                "Something went wrong while updating quantity."
            );
        }
    };

    // ===============================
    // REMOVE FROM CART
    // ===============================

    const removeFromCart = async (
        productId
    ) => {

        const token =
            localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            navigate("/login");
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:3000/api/cart/${productId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            if (data.success) {

                setCartItems(
                    (previousItems) =>
                        previousItems.filter(
                            (item) =>
                                item.productId._id !==
                                productId
                        )
                );

            } else {

                alert(
                    data.message ||
                    "Unable to remove product"
                );
            }

        } catch (error) {

            console.error(
                "Remove cart error:",
                error
            );

            alert(
                "Something went wrong while removing product."
            );
        }
    };

    // ===============================
    // PROCEED TO CHECKOUT
    // ===============================

    const handleCheckout = () => {

        const token =
            localStorage.getItem("token");

        if (!token) {

            alert("Please login first.");

            navigate("/login");

            return;
        }

        if (
            !cartItems ||
            cartItems.length === 0
        ) {

            alert(
                "Your cart is empty."
            );

            return;
        }

        // Go to checkout page
        navigate("/checkout");
    };

    // ===============================
    // TOTAL ITEMS
    // ===============================

    const totalItems =
        cartItems.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    // ===============================
    // TOTAL PRICE
    // ===============================

    const totalPrice =
        cartItems.reduce(
            (total, item) =>
                total +
                item.productId.price *
                item.quantity,
            0
        );

    // ===============================
    // LOADING
    // ===============================

    if (loading) {

        return (

            <section className="py-30">

                <div className="text-center">

                    <h2 className="text-2xl font-bold">
                        Loading Cart...
                    </h2>

                </div>

            </section>
        );
    }

    // ===============================
    // CART UI
    // ===============================

    return (

        <section className="py-30">

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ==========================
                    HEADING
                ========================== */}

                <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">

                    My Cart 🛒

                </h1>

                {/* ==========================
                    EMPTY CART
                ========================== */}

                {cartItems.length === 0 ? (

                    <div className="text-center py-20">

                        <div className="text-6xl mb-5">
                            🛒
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-500">

                            Your cart is empty

                        </h2>

                        <p className="text-gray-400 mt-2">
                            Add some products to your cart.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/allproducts")
                            }
                            className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition"
                        >
                            Continue Shopping
                        </button>

                    </div>

                ) : (

                    <>

                        {/* ==========================
                            CART ITEMS
                        ========================== */}

                        <div className="space-y-5">

                            {cartItems.map(
                                (item) => {

                                    const product =
                                        item.productId;

                                    return (

                                        <div
                                            key={
                                                item._id
                                            }
                                            className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-xl shadow-md p-5"
                                        >

                                            {/* ==================
                                                IMAGE
                                            ================== */}

                                            <div className="w-32 h-32 flex items-center justify-center">

                                                <img
                                                    src={
                                                        imageMap[
                                                        product.image
                                                        ]
                                                    }
                                                    alt={
                                                        product.title
                                                    }
                                                    className="w-full h-full object-contain"
                                                />

                                            </div>

                                            {/* ==================
                                                PRODUCT INFO
                                            ================== */}

                                            <div className="flex-1 text-center md:text-left">

                                                <h2 className="text-xl font-bold">

                                                    {
                                                        product.title
                                                    }

                                                </h2>

                                                <p className="text-orange-500 font-semibold text-lg mt-1">

                                                    ₹
                                                    {
                                                        product.price
                                                    }

                                                </p>

                                            </div>

                                            {/* ==================
                                                QUANTITY
                                            ================== */}

                                            <div className="flex items-center gap-3">

                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            product._id,
                                                            item.quantity -
                                                            1
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity ===
                                                        1
                                                    }
                                                    className="w-9 h-9 rounded-full bg-gray-200 text-xl font-bold hover:bg-orange-200 disabled:opacity-40"
                                                >
                                                    −
                                                </button>

                                                <span className="text-lg font-bold w-6 text-center">

                                                    {
                                                        item.quantity
                                                    }

                                                </span>

                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            product._id,
                                                            item.quantity +
                                                            1
                                                        )
                                                    }
                                                    className="w-9 h-9 rounded-full bg-orange-500 text-white text-xl font-bold hover:bg-orange-600"
                                                >
                                                    +
                                                </button>

                                            </div>

                                            {/* ==================
                                                ITEM TOTAL
                                            ================== */}

                                            <div className="text-center min-w-24">

                                                <p className="font-bold text-lg">

                                                    ₹
                                                    {(
                                                        product.price *
                                                        item.quantity
                                                    ).toFixed(2)}

                                                </p>

                                                <button
                                                    onClick={() =>
                                                        removeFromCart(
                                                            product._id
                                                        )
                                                    }
                                                    className="mt-2 text-red-500 hover:text-red-700 font-medium cursor-pointer"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                        {/* ==========================
                            CART SUMMARY
                        ========================== */}

                        <div className="mt-10 flex justify-end">

                            <div className="bg-zinc-100 rounded-xl shadow-md p-6 w-full sm:w-96">

                                <h2 className="text-2xl font-bold mb-5">
                                    Cart Summary
                                </h2>

                                {/* TOTAL ITEMS */}

                                <div className="flex justify-between text-lg">

                                    <span>
                                        Total Items
                                    </span>

                                    <span>
                                        {
                                            totalItems
                                        }
                                    </span>

                                </div>

                                {/* TOTAL */}

                                <div className="flex justify-between text-xl font-bold mt-4">

                                    <span>
                                        Total
                                    </span>

                                    <span className="text-orange-500">

                                        ₹
                                        {totalPrice.toFixed(
                                            2
                                        )}

                                    </span>

                                </div>

                                {/* ==================
                                    CHECKOUT BUTTON
                                ================== */}

                                <button
                                    onClick={
                                        handleCheckout
                                    }
                                    className="w-full mt-6 bg-orange-500 text-white py-3 rounded-full font-semibold hover:bg-orange-600 transition"
                                >

                                    Proceed to Checkout

                                </button>

                            </div>

                        </div>

                    </>
                )}

            </div>

        </section>
    );
};

export default Cart;