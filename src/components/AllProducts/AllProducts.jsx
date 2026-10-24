import { useEffect, useState } from "react";
import Buttons from "../Buttons/Buttons";
import { getProductImage } from "../../utils/productImage";
import { useLocation } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";
import { useWishlist } from "../CartContext/WishlistContext";
import { getProducts } from "../../utils/products";

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

                setProducts(await getProducts());

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
                                            src={getProductImage(product.image, imageMap)}
                                            alt={product.title}
                                            loading="lazy"
                                            decoding="async"
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