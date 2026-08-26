import React from "react";
import Buttons from "../Buttons/Buttons";

// Images
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

const smallCards = [
    { id: 1, image: Banana, title: "Banana", price: 40, category: "fruits" },
    { id: 2, image: Tofu, title: "Tofu", price: 180, category: "dairy" },
    { id: 3, image: Yogurt, title: "Yogurt", price: 90, category: "dairy" },
    { id: 4, image: Slice_Cheese, title: "Slice Cheese", price: 220, category: "dairy" },
    { id: 5, image: Shrimp, title: "Shrimp", price: 350, category: "seafood" },
    { id: 6, image: Salmon, title: "Salmon", price: 480, category: "seafood" },
    { id: 7, image: RicottaCheese, title: "Ricotta Cheese", price: 280, category: "dairy" },
    { id: 8, image: Pineapple, title: "Pineapple", price: 70, category: "fruits" },
    { id: 9, image: Milk, title: "Milk", price: 60, category: "dairy" },
    { id: 10, image: Lettuce, title: "Lettuce", price: 55, category: "fruits" },
    { id: 11, image: Kiwi, title: "Kiwi", price: 180, category: "fruits" },
    { id: 12, image: Grapes, title: "Grapes", price: 120, category: "fruits" },
    { id: 13, image: Eggs, title: "Eggs", price: 95, category: "dairy" },
    { id: 14, image: Eggplant, title: "Eggplant", price: 45, category: "fruits" },
    { id: 15, image: Cheese, title: "Cheese", price: 250, category: "dairy" },
    { id: 16, image: Capsicum, title: "Capsicum", price: 80, category: "fruits" },
    { id: 17, image: Cabbage, title: "Cabbage", price: 40, category: "fruits" },
    { id: 18, image: Butter, title: "Butter", price: 210, category: "dairy" },
    { id: 19, image: Broccoli, title: "Broccoli", price: 140, category: "fruits" },
    { id: 20, image: Beef, title: "Beef", price: 650, category: "seafood" },
    { id: 21, image: Slice_Cheese, title: "Cheddar Slice", price: 240, category: "dairy" },
    { id: 22, image: Broccoli, title: "Fresh Broccoli", price: 160, category: "fruits" },
    { id: 23, image: Pineapple, title: "Sweet Pineapple", price: 95, category: "fruits" },
];

const Cards = ({ category }) => {
    const filteredCards = smallCards.filter(
        (item) => item.category === category
    );

    return (
        <section className="py-30">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-6">
                    {filteredCards.map((smallCard) => (
                        <div
                            key={smallCard.id}
                            className="w-full sm:w-[48%] lg:w-[31%] xl:w-[23%] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            <div className="h-52 flex items-center justify-center bg-white p-4">
                                <img
                                    src={smallCard.image}
                                    alt={smallCard.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="bg-zinc-100 p-6 text-center">
                                <h3 className="text-xl font-bold">{smallCard.title}</h3>

                                <p className="text-orange-500 text-xl font-semibold mt-2 mb-5">
                                    ₹{smallCard.price}
                                </p>

                                <Buttons content="Add to Cart" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Cards;