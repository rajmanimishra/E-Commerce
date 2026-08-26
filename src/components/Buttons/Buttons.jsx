import React, { useState } from "react";
import { useCart } from "../CartContext/CartContext";

const Buttons = ({ content, productId }) => {

    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);

    const { addToCart } = useCart();


    const handleAddToCart = async () => {

        if (!productId) {
            console.error("Product ID is missing");
            return;
        }

        try {

            setLoading(true);

            const success = await addToCart(productId);

            if (success) {

                setAdded(true);

                setTimeout(() => {
                    setAdded(false);
                }, 1500);

            }

        } catch (error) {

            console.error("Add to cart error:", error);

        } finally {

            setLoading(false);

        }
    };


    return (
        <button
            onClick={handleAddToCart}
            disabled={loading}
            className="bg-linear-to-b from-orange-400 to-orange-500 text-white px-8 py-1.5 rounded-2xl text-lg hover:scale-105 cursor-pointer disabled:opacity-60"
        >
            {loading
                ? "Adding..."
                : added
                    ? "Added ✓"
                    : content}
        </button>
    );
};


export default Buttons;