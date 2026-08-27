import React, { useEffect, useState } from "react";
import Heading from "../Heading/Heading";
import Buttons from "../Buttons/Buttons";
import { Link } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";
import { useWishlist } from "../CartContext/WishlistContext";

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


const Products = () => {

    const categories = [
        "All",
        "Fruits",
        "Vegetables",
        "Dairy",
        "SeaFood",
        "Protein",
    ];

    const [activeTab, setActiveTab] = useState("All");
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Wishlist
    const {
        addToWishlist,
        removeFromWishlist,
        isInWishlist
    } = useWishlist();


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


    // Fetch products from MongoDB
    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const response = await fetch(
                    "https://e-commerce-z6p4.onrender.com/api/products"
                );

                const data = await response.json();

                if (data.success) {
                    setCards(data.products);
                }

            } catch (error) {

                console.error(
                    "Error fetching products:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        fetchProducts();

    }, []);


    // Wishlist button
    const handleWishlist = async (productId) => {

        if (isInWishlist(productId)) {

            await removeFromWishlist(productId);

        } else {

            await addToWishlist(productId);

        }
    };


    // Filter products
    const filteredCards =
        activeTab === "All"
            ? cards
            : cards.filter(
                (card) => card.category === activeTab
            );


    return (

        <section className="py-10">

            <div className="max-w-7xl mx-auto px-6">

                {/* Heading */}

                <Heading
                    highlight="Our"
                    heading="Products"
                />


                {/* Categories */}

                <div className="mt-8 flex flex-wrap justify-center gap-4">

                    {categories.map((category) => (

                        <button
                            key={category}
                            onClick={() =>
                                setActiveTab(category)
                            }
                            className={`px-5 py-2 rounded-full font-medium transition
                                ${activeTab === category
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-200 hover:bg-orange-200"
                                }`}
                        >
                            {category}
                        </button>

                    ))}

                </div>


                {/* Loading */}

                {loading && (

                    <div className="text-center mt-10">

                        <p className="text-gray-500">
                            Loading products...
                        </p>

                    </div>

                )}


                {/* Products */}

                {!loading && (

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">

                        {filteredCards
                            .slice(0, 8)
                            .map((card) => (

                                <div
                                    key={card._id}
                                    className="relative p-4 rounded-xl shadow-md hover:shadow-xl transition"
                                >

                                    {/* Wishlist */}

                                    <button
                                        onClick={() =>
                                            handleWishlist(
                                                card._id
                                            )
                                        }
                                        className="absolute top-4 right-4 text-2xl z-10 hover:scale-110 transition"
                                        title={
                                            isInWishlist(
                                                card._id
                                            )
                                                ? "Remove from wishlist"
                                                : "Add to wishlist"
                                        }
                                    >

                                        <AiFillHeart
                                            className={
                                                isInWishlist(
                                                    card._id
                                                )
                                                    ? "text-red-500"
                                                    : "text-gray-400"
                                            }
                                        />

                                    </button>


                                    {/* Product Image */}

                                    <div className="flex justify-center">

                                        <img
                                            src={
                                                imageMap[
                                                card.image
                                                ]
                                            }
                                            alt={card.title}
                                            className="w-40 h-40 object-contain"
                                        />

                                    </div>


                                    {/* Product Details */}

                                    <div className="mt-4 text-center">

                                        <h3 className="text-lg font-semibold">
                                            {card.title}
                                        </h3>


                                        <p className="text-orange-500 text-xl font-bold mt-2">
                                            ₹{card.price}
                                        </p>


                                        {/* Add To Cart */}

                                        <div className="mt-5">

                                            <Buttons
                                                content="Add to cart"
                                                productId={
                                                    card._id
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            ))}

                    </div>

                )}


                {/* No Products */}

                {!loading &&
                    filteredCards.length === 0 && (

                        <div className="text-center mt-10">

                            <p className="text-gray-500">
                                No products found.
                            </p>

                        </div>

                    )}


                {/* View All */}

                <div className="flex justify-center mt-10">

                    <Link
                        to="/allproducts"
                        className="inline-block bg-linear-to-b from-orange-400 to-orange-500 text-white px-8 py-2 rounded-full hover:scale-105 transition"
                    >
                        View All
                    </Link>

                </div>

            </div>

        </section>

    );
};


export default Products;