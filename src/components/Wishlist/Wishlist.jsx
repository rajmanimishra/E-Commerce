import React from "react";
import { useWishlist } from "../CartContext/WishlistContext";
import { useCart } from "../CartContext/CartContext";

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


const Wishlist = () => {

    const {
        wishlistItems,
        loading,
        removeFromWishlist
    } = useWishlist();

    const { addToCart } = useCart();


    // =========================
    // IMAGE MAP
    // =========================

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


    // =========================
    // ADD TO CART
    // =========================

    const handleAddToCart = async (productId) => {

        const success = await addToCart(productId);

        if (success) {

            await removeFromWishlist(productId);

        }

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <section className="py-32">

                <div className="text-center">

                    <h2 className="text-2xl font-bold text-gray-500">

                        Loading Wishlist...

                    </h2>

                </div>

            </section>

        );

    }


    return (

        <section className="py-32">

            <div className="max-w-7xl mx-auto px-5">


                {/* =========================
                    HEADING
                ========================= */}

                <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">

                    My Wishlist ❤️

                </h1>



                {/* =========================
                    EMPTY WISHLIST
                ========================= */}

                {wishlistItems.length === 0 ? (

                    <div className="text-center py-20">

                        <h2 className="text-2xl font-semibold text-gray-500">

                            Your wishlist is empty ❤️

                        </h2>

                        <p className="text-gray-400 mt-2">

                            Add some products to your wishlist.

                        </p>

                    </div>

                ) : (


                    /* =========================
                       WISHLIST PRODUCTS
                    ========================= */

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">


                        {wishlistItems.map((item) => {

                            const product = item.productId;


                            // Safety check
                            if (!product) {
                                return null;
                            }


                            return (

                                <div
                                    key={item._id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                                >


                                    {/* =========================
                                        PRODUCT IMAGE
                                    ========================= */}

                                    <div className="h-52 flex items-center justify-center bg-white p-5">

                                        <img
                                            src={imageMap[product.image]}
                                            alt={product.title}
                                            className="w-full h-full object-contain"
                                        />

                                    </div>



                                    {/* =========================
                                        PRODUCT DETAILS
                                    ========================= */}

                                    <div className="bg-zinc-100 p-5 text-center">


                                        <h3 className="text-xl font-bold">

                                            {product.title}

                                        </h3>


                                        <p className="text-orange-500 text-xl font-semibold mt-2">

                                            ₹{product.price}

                                        </p>



                                        {/* =========================
                                            BUTTONS
                                        ========================= */}

                                        <div className="flex justify-center gap-3 mt-5">


                                            {/* ADD TO CART */}

                                            <button
                                                onClick={() =>
                                                    handleAddToCart(product._id)
                                                }
                                                className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition"
                                            >

                                                Add to Cart

                                            </button>



                                            {/* REMOVE */}

                                            <button
                                                onClick={() =>
                                                    removeFromWishlist(product._id)
                                                }
                                                className="border border-red-500 text-red-500 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition"
                                            >

                                                Remove

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </section>

    );

};


export default Wishlist;