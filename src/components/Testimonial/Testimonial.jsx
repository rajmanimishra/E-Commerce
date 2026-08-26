import React from "react";
import { FaStar } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import User1 from "../../assets/customer1.jpg";
import User2 from "../../assets/customer2.jpg";
import User3 from "../../assets/customer3.jpg";

const testimonials = [
    {
        id: 1,
        image: User1,
        name: "Emily Johnson",
        role: "Food Blogger",
        review:
            "Grocify is my go-to store for all grocery needs. Their produce is always fresh, and the delivery is super fast. I love the user-friendly interface and variety of organic options!",
    },
    {
        id: 2,
        image: User2,
        name: "David Smith",
        role: "Chef",
        review:
            "As a chef, quality ingredients are everything. Grocify consistently delivers the best vegetables, herbs, and pantry staples. Highly recommended!",
    },
    {
        id: 3,
        image: User3,
        name: "Alya Zahra",
        role: "Model",
        review:
            "Shopping online with Grocify has saved me so much time. I trust them for my family's weekly groceries—always fresh, affordable, and reliable.",
    },
];

const Testimonials = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-5">

                {/* Heading */}

                <div className="flex flex-col items-center relative">

                    <h2 className="text-4xl font-bold">
                        <span className="text-orange-500">Customers</span>{" "}
                        <span className="text-gray-800">Saying</span>
                    </h2>

                    <div className="w-24 h-1 bg-orange-400 rounded-full mt-3"></div>

                    {/* Buttons */}

                    <div className="absolute right-0 top-2 flex gap-3">

                        <button className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-orange-500 hover:text-white duration-300 flex items-center justify-center">

                            <IoChevronBack size={22} />

                        </button>

                        <button className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-orange-500 hover:text-white duration-300 flex items-center justify-center">

                            <IoChevronForward size={22} />

                        </button>

                    </div>

                </div>

                {/* Cards */}

                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mt-16">

                    {testimonials.map((item) => (

                        <div
                            key={item.id}
                            className="bg-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-lg duration-300"
                        >

                            {/* User */}

                            <div className="flex items-center gap-4">

                                <img
                                    src={item.image}
                                    alt=""
                                    className="w-16 h-16 rounded-full border-2 border-orange-500 object-cover" />

                                <div>

                                    <h3 className="font-bold text-xl">
                                        {item.name}
                                    </h3>

                                    <p className="text-gray-500 text-sm">
                                        {item.role}
                                    </p>

                                    <div className="flex gap-1 mt-2 text-yellow-400">

                                        {[...Array(5)].map((_, index) => (
                                            <FaStar key={index} />
                                        ))}

                                    </div>

                                </div>

                            </div>

                            {/* Review */}

                            <p className="text-gray-500 leading-8 mt-8">
                                {item.review}
                            </p>

                        </div>

                    ))}

                </div>

            </div>
        </section>
    );
};

export default Testimonials;