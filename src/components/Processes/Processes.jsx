import React from "react";
import { Link } from "react-router-dom";

function Processes() {
    const steps = [
        {
            step: "Step 01",
            icon: "🌾",
            title: "Harvested Fresh",
            text: "Partner farmers pick produce at peak ripeness, early each morning.",
        },
        {
            step: "Step 02",
            icon: "🔍",
            title: "Quality Checked",
            text: "Every batch is sorted and inspected so only the best makes the cut.",
        },
        {
            step: "Step 03",
            icon: "📦",
            title: "Packed With Care",
            text: "We pack orders in eco-friendly crates to lock in freshness.",
        },
        {
            step: "Step 04",
            icon: "🚴",
            title: "Delivered Same-Day",
            text: "Your order reaches your doorstep the same day, guaranteed.",
        },
    ];

    return (
        <div className="font-sans text-black pt-24">

            {/* Page Title */}
            <section className="bg-orange-50 py-14 text-center">
                <h1 className="text-4xl font-extrabold">Our Process</h1>

                <p className="mt-2 text-gray-500 text-sm">
                    <Link to="/" className="text-orange-500 font-semibold">
                        Home
                    </Link>{" "}
                    • Process
                </p>
            </section>

            {/* Steps */}
            <section className="max-w-6xl mx-auto px-6 py-16 text-center">

                <span className="inline-block bg-orange-50 text-orange-500 font-semibold text-sm px-5 py-2 rounded-full mb-5">
                    How It Works
                </span>

                <h2 className="text-3xl font-extrabold mb-3">
                    From Farm To Your Fridge
                    <br className="hidden sm:block" />
                    In 4 Simple Steps
                </h2>

                <p className="text-gray-500 max-w-md mx-auto">
                    Here's exactly what happens between the farm and your kitchen.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">

                    {steps.map((s) => (
                        <div
                            key={s.step}
                            className="bg-orange-50 rounded-2xl p-7 text-left hover:shadow-lg duration-300"
                        >
                            <div className="text-orange-500 font-extrabold text-sm mb-3">
                                {s.step}
                            </div>

                            <div className="text-4xl mb-3">
                                {s.icon}
                            </div>

                            <h3 className="font-bold text-xl mb-2">
                                {s.title}
                            </h3>

                            <p className="text-gray-500 text-sm leading-7">
                                {s.text}
                            </p>
                        </div>
                    ))}

                </div>

            </section>

            {/* Quality Promise */}
            <section className="bg-orange-50 py-16">

                <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">

                    <div className="flex-1">

                        <span className="inline-block bg-white text-orange-500 font-semibold text-sm px-5 py-2 rounded-full mb-5">
                            Quality Promise
                        </span>

                        <h2 className="text-3xl font-extrabold mb-4">
                            Every Step Is Built Around{" "}
                            <span className="text-orange-500">Freshness</span>
                        </h2>

                        <ul className="space-y-4">

                            <li className="flex gap-3">
                                <span className="text-orange-500 font-bold">✓</span>
                                <p>Sourced from farms within 100km for maximum freshness.</p>
                            </li>

                            <li className="flex gap-3">
                                <span className="text-orange-500 font-bold">✓</span>
                                <p>Cold-chain storage maintains perfect temperature.</p>
                            </li>

                            <li className="flex gap-3">
                                <span className="text-orange-500 font-bold">✓</span>
                                <p>No artificial ripening agents or preservatives.</p>
                            </li>

                        </ul>

                        <Link
                            to="/contact"
                            className="inline-block mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full duration-300"
                        >
                            Talk To Us
                        </Link>

                    </div>

                    <div className="flex-1">
                        <img
                            src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=700&q=80"
                            alt="Delivery"
                            className="rounded-2xl w-full"
                        />
                    </div>

                </div>

            </section>

        </div>
    );
}

export default Processes;