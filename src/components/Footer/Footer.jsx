import React from "react";
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-zinc-200 text-black mt-20">
            <div className="max-w-7xl mx-auto px-6 py-16">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

                    {/* Logo */}
                    <div className="lg:col-span-2">
                        {/* <h2 className="text-3xl font-bold"> */}
                        <a href="#" className="text-2xl font-extrabold">
                            Gr
                            <span className="text-orange-500 text-[35px] font-bold">
                                o
                            </span>
                            cify
                        </a>
                        {/* </h2> */}

                        <p className="text-gray-400 mt-5 leading-7">
                            Grocify delivers fresh vegetables, fruits, dairy products and
                            groceries directly to your doorstep with the best quality and
                            affordable prices.
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-4 mt-6">
                            {[
                                <FaFacebookF />,
                                <FaTwitter />,
                                <FaInstagram />,
                                <FaLinkedinIn />,
                            ].map((icon, index) => (
                                <div
                                    key={index}
                                    className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 cursor-pointer flex justify-center items-center duration-300"
                                >
                                    {icon}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-semibold mb-6">Quick Links</h3>

                        <ul className="space-y-3 text-gray-400">
                            <li className="hover:text-orange-500 cursor-pointer">Home</li>
                            <li className="hover:text-orange-500 cursor-pointer">Shop</li>
                            <li className="hover:text-orange-500 cursor-pointer">Categories</li>
                            <li className="hover:text-orange-500 cursor-pointer">About Us</li>
                            <li className="hover:text-orange-500 cursor-pointer">Contact</li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div>
                        <h3 className="text-xl font-semibold mb-6">Support</h3>

                        <ul className="space-y-3 text-gray-400">
                            <li className="hover:text-orange-500 cursor-pointer">Help Center</li>
                            <li className="hover:text-orange-500 cursor-pointer">FAQs</li>
                            <li className="hover:text-orange-500 cursor-pointer">Privacy Policy</li>
                            <li className="hover:text-orange-500 cursor-pointer">Terms & Conditions</li>
                            <li className="hover:text-orange-500 cursor-pointer">Returns</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-xl font-semibold mb-6">Contact</h3>

                        <div className="space-y-5 text-gray-400">

                            <div className="flex gap-3">
                                <FaMapMarkerAlt className="text-orange-500 mt-1" />
                                <p>Lucknow, Uttar Pradesh, India</p>
                            </div>

                            <div className="flex gap-3">
                                <FaPhoneAlt className="text-orange-500 mt-1" />
                                <p>+91 9988047018</p>
                            </div>

                            <div className="flex gap-3">
                                <FaEnvelope className="text-orange-500 mt-1" />
                                <p>support@grocify.com</p>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Newsletter */}

                <div className="border-t border-gray-700 mt-14 pt-10 flex flex-col lg:flex-row justify-between items-center gap-6">

                    <div>
                        <h3 className="text-2xl font-semibold">
                            Subscribe Newsletter
                        </h3>

                        <p className="text-gray-400 mt-2">
                            Get latest offers and grocery updates.
                        </p>
                    </div>

                    <div className="flex w-full lg:w-auto">

                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-gray-800 px-5 py-3 rounded-l-lg outline-none w-full lg:w-80"
                        />

                        <button className="bg-orange-500 hover:bg-orange-600 px-6 rounded-r-lg font-semibold duration-300 cursor-pointer">
                            Subscribe
                        </button>

                    </div>

                </div>

            </div>

            {/* Bottom */}

            <div className="border-t border-gray-800 py-5 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Grocify. All Rights Reserved.
            </div>

        </footer>
    );
};

export default Footer;