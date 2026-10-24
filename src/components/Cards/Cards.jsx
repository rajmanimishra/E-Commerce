import { useEffect, useState } from "react";
import Buttons from "../Buttons/Buttons";
import { getProductImage } from "../../utils/productImage";
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
                setProducts(await getProducts());
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
                                    src={getProductImage(product.image, imageMap)}
                                    alt={product.title}
                                    loading="lazy"
                                    decoding="async"
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