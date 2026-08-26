import React, { useEffect, useState } from "react";
import Buttons from "../Buttons/Buttons";

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

const Cards = ({ category }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    "[https://e-commerce-z6p4.onrender.com](https://e-commerce-z6p4.onrender.com)/api/products"
                );

                const data = await response.json();

                if (data.success) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Category filter
    const filteredCards = products.filter(
        (product) =>
            product.category.toLowerCase() === category.toLowerCase()
    );

    if (loading) {
        return (
            <section className="py-30">
                <div className="text-center">
                    <p className="text-gray-500 text-xl">
                        Loading Products...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-30">
            <div className="max-w-7xl mx-auto px-4">

                <div className="flex flex-wrap justify-center gap-6">

                    {filteredCards.map((product) => (
                        <div
                            key={product._id}
                            className="w-full sm:w-[48%] lg:w-[31%] xl:w-[23%] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                        >

                            {/* Image */}
                            <div className="h-52 flex items-center justify-center bg-white p-4">

                                <img
                                    src={imageMap[product.image]}
                                    alt={product.title}
                                    className="w-full h-full object-contain"
                                />

                            </div>

                            {/* Content */}
                            <div className="bg-zinc-100 p-6 text-center">

                                <h3 className="text-xl font-bold">
                                    {product.title}
                                </h3>

                                <p className="text-orange-500 text-xl font-semibold mt-2 mb-5">
                                    ₹{product.price}
                                </p>

                                <Buttons
                                    content="Add to Cart"
                                    productId={product._id}
                                />

                            </div>

                        </div>
                    ))}

                </div>

            </div>
        </section>
    );
};

export default Cards;