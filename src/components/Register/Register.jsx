import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch(
                "https://e-commerce-z6p4.onrender.com/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("Registration successful");

                navigate("/login");

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.log(error);
            alert("Something went wrong");

        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-5">

            <div className="w-full max-w-md">

                {/* Logo */}

                <div className="text-center mb-8">

                    <h1 className="text-4xl font-extrabold text-gray-800">
                        Gr
                        <span className="text-orange-500">
                            o
                        </span>
                        cify
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Create your account and start shopping.
                    </p>

                </div>


                {/* Register Card */}

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">

                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                        Create Account 🛒
                    </h2>


                    <form
                        onSubmit={handleRegister}
                        className="space-y-5"
                    >

                        {/* Name */}

                        <div>

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                                required
                            />

                        </div>


                        {/* Email */}

                        <div>

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                                required
                            />

                        </div>


                        {/* Password */}

                        <div>

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                                required
                            />

                        </div>


                        {/* Register Button */}

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-lg hover:from-red-700 hover:to-orange-600 transition duration-300 shadow-md hover:shadow-lg"
                        >
                            Create Account
                        </button>

                    </form>


                    {/* Login */}

                    <p className="text-center text-gray-500 mt-6 text-sm">

                        Already have an account?

                        <span
                            onClick={() => navigate("/login")}
                            className="text-orange-500 font-semibold cursor-pointer hover:underline ml-1"
                        >
                            Login
                        </span>

                    </p>

                </div>


                <p className="text-center text-gray-400 text-xs mt-6">
                    © 2026 Grocify. All rights reserved.
                </p>

            </div>

        </div>
    );
};

export default Register;