import React, { useEffect, useState } from "react";
import Buttons from "../Buttons/Buttons";
import { useLocation } from "react-router-dom";
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


const AllProducts = () => {

    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);


    // Wishlist
    const {
        addToWishlist,
        removeFromWishlist,
        isInWishlist
    } = useWishlist();


    const search =
        new URLSearchParams(location.search)
            .get("search")
            ?.toLowerCase() || "";


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

                    setProducts(data.products);

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


    // Wishlist Handler
    const handleWishlist = async (productId) => {

        if (isInWishlist(productId)) {

            await removeFromWishlist(productId);

        } else {

            await addToWishlist(productId);

        }

    };


    // Search filter
    const filteredProducts = products.filter(
        (item) =>
            item.title
                .toLowerCase()
                .includes(search)
    );


    return (

        <section className="py-30">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


                {/* Loading */}

                {loading && (

                    <div className="flex justify-center">

                        <h2 className="text-2xl font-bold text-gray-500">

                            Loading Products...

                        </h2>

                    </div>

                )}


                {/* Products */}

                {!loading && (

                    <div className="flex flex-wrap justify-center gap-6">

                        {filteredProducts.length > 0 ? (

                            filteredProducts.map((product) => (

                                <div
                                    key={product._id}
                                    className="relative w-full sm:w-[48%] lg:w-[31%] xl:w-[23%] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                                >


                                    {/* Wishlist Heart */}

                                    <button
                                        onClick={() =>
                                            handleWishlist(
                                                product._id
                                            )
                                        }
                                        className="absolute top-4 right-4 z-10 text-3xl hover:scale-110 transition-transform"
                                        title={
                                            isInWishlist(
                                                product._id
                                            )
                                                ? "Remove from wishlist"
                                                : "Add to wishlist"
                                        }
                                    >

                                        <AiFillHeart
                                            className={
                                                isInWishlist(
                                                    product._id
                                                )
                                                    ? "text-red-500"
                                                    : "text-gray-400"
                                            }
                                        />

                                    </button>


                                    {/* Image */}

                                    <div className="h-52 flex items-center justify-center bg-white p-4">

                                        <img
                                            src={
                                                imageMap[
                                                product.image
                                                ]
                                            }
                                            alt={product.title}
                                            className="w-full h-full object-contain"
                                        />

                                    </div>


                                    {/* Content */}

                                    <div className="bg-zinc-100 p-6 text-center">

                                        <h3 className="text-xl md:text-2xl font-bold">

                                            {product.title}

                                        </h3>


                                        <p className="text-orange-500 text-xl font-semibold mt-2 mb-5">

                                            ₹{product.price}

                                        </p>


                                        {/* Add To Cart */}

                                        <Buttons
                                            content="Add to Cart"
                                            productId={
                                                product._id
                                            }
                                        />

                                    </div>

                                </div>

                            ))

                        ) : (

                            <h2 className="text-2xl font-bold text-red-500">

                                No Product Found

                            </h2>

                        )}

                    </div>

                )}

            </div>

        </section>

    );

};


export default AllProducts;