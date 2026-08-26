import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                // Save JWT token
                localStorage.setItem("token", data.token);

                // Go to Home page
                navigate("/");

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

            {/* Login Card */}

            <div className="w-full max-w-md">

                {/* Logo / Heading */}

                <div className="text-center mb-8">

                    <h1 className="text-4xl font-extrabold text-gray-800">
                        Gr
                        <span className="text-orange-500">
                            o
                        </span>
                        cify
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Welcome back! Login to continue shopping.
                    </p>

                </div>


                {/* Card */}

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">

                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                        Welcome Back 👋
                    </h2>


                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >

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
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                                required
                            />

                        </div>


                        {/* Login Button */}

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-lg hover:from-red-700 hover:to-orange-600 transition duration-300 shadow-md hover:shadow-lg"
                        >
                            Login
                        </button>

                    </form>


                    {/* Register */}

                    <p className="text-center text-gray-500 mt-6 text-sm">

                        Don't have an account?

                        <span
                            onClick={() => navigate("/register")}
                            className="text-orange-500 font-semibold cursor-pointer hover:underline ml-1"
                        >
                            Register
                        </span>

                    </p>

                </div>


                {/* Bottom Text */}

                <p className="text-center text-gray-400 text-xs mt-6">
                    © 2026 Grocify. All rights reserved.
                </p>

            </div>

        </div>
    );
};

export default Login;