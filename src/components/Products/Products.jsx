import React, { useState } from "react";
import Heading from "../Heading/Heading";
import Buttons from "../Buttons/Buttons";
import { Link } from "react-router-dom";

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

export const cards = [
    { id: 1, name: "Banana", image: Banana, price: 40, category: "Fruits" },
    { id: 2, name: "Tofu", image: Tofu, price: 180, category: "Protein" },
    { id: 3, name: "Yogurt", image: Yogurt, price: 90, category: "Dairy" },
    { id: 4, name: "Slice Cheese", image: Slice_Cheese, price: 220, category: "Dairy" },
    { id: 5, name: "Shrimp", image: Shrimp, price: 550, category: "SeaFood" },
    { id: 6, name: "Salmon", image: Salmon, price: 850, category: "SeaFood" },
    { id: 7, name: "Ricotta Cheese", image: RicottaCheese, price: 320, category: "Dairy" },
    { id: 8, name: "Pineapple", image: Pineapple, price: 80, category: "Fruits" },
    { id: 9, name: "Milk", image: Milk, price: 65, category: "Dairy" },
    { id: 10, name: "Lettuce", image: Lettuce, price: 70, category: "Vegetables" },
    { id: 11, name: "Kiwi", image: Kiwi, price: 180, category: "Fruits" },
    { id: 12, name: "Grapes", image: Grapes, price: 120, category: "Fruits" },
    { id: 13, name: "Eggs", image: Eggs, price: 90, category: "Protein" },
    { id: 14, name: "Eggplant", image: Eggplant, price: 60, category: "Vegetables" },
    { id: 15, name: "Cheese", image: Cheese, price: 280, category: "Dairy" },
    { id: 16, name: "Capsicum", image: Capsicum, price: 100, category: "Vegetables" },
    { id: 17, name: "Cabbage", image: Cabbage, price: 50, category: "Vegetables" },
    { id: 18, name: "Butter", image: Butter, price: 260, category: "Dairy" },
    { id: 19, name: "Broccoli", image: Broccoli, price: 140, category: "Vegetables" },
    { id: 20, name: "Beef", image: Beef, price: 750, category: "Protein" },
];

const Products = () => {
    const categories = ["All", "Fruits", "Vegetables", "Dairy", "SeaFood", "Protein"];

    const [activeTab, setActiveTab] = useState("All");

    const filteredCards =
        activeTab === "All"
            ? cards
            : cards.filter((card) => card.category === activeTab);

    return (
        <section className="py-10">
            <div className="max-w-7xl mx-auto px-6">
                <Heading highlight="Our" heading="Products" />

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveTab(category)}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
                    {filteredCards.slice(0, 8).map((card) => (
                        <div
                            key={card.id}
                            className="p-4 rounded-xl shadow-md hover:shadow-xl transition" >
                            <div className="flex justify-center">
                                <img
                                    src={card.image}
                                    alt={card.name}
                                    className="w-40 h-40 object-contain"
                                />
                            </div>

                            <div className="mt-4 text-center">
                                <h3 className="text-lg font-semibold">{card.name}</h3>

                                <p className="text-orange-500 text-xl font-bold mt-2">
                                    ₹{card.price}
                                </p>

                                <div className="mt-5">
                                    <Buttons content="Add to cart" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-10">
                    <Link
                        to="/allproducts"
                        className="inline-block bg-linear-to-b from-orange-400 to-orange-500 text-white px-8 py-2 rounded-full hover:scale-105 transition" >
                        View All
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Products;