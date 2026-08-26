import React from 'react'
import Heading from '../Heading/Heading'
// import { FaHeart } from "react-icons/fa";
import { FaHeart, FaLeaf } from "react-icons/fa";
import FruitsVeggCat from '../../assets/grocery.png'
import { FaShieldAlt, FaSeedling } from "react-icons/fa";



const Values = () => {
    return (
        <section>
            {/* our vaalues heading */}
            <div className='max-w-[1400px] mx-auto  px-10'>
                <Heading highlight='Our' heading='Values' />
            </div>

            <div className='py-20  '>
                <div className='max-w-7xl mx-auto px-6  '>
                    <div className='grid grid-cols-1 text-2xl md:grid-cols-1 lg:grid-cols-3 items-center gap-10 '>
                        {/* left part */}

                        <div className="flex flex-col gap-20">
                            {/* Trust...,,...... */}
                            <div className="flex items-center justify-end gap-5">
                                {/* Text   ........ */}
                                <div className="text-right">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Trust
                                    </h2>

                                    <p className="text-gray-500 mt-2 max-w-xs">
                                        It is a long established fact that a reader will be distracted by the readable content.
                                    </p>
                                </div>

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                                    <FaHeart className="text-white text-2xl" />
                                </div>

                            </div>

                            {/* Always Fresh */}
                            <div className="flex items-center justify-end gap-5">

                                {/* Text */}
                                <div className="text-right">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Always Fresh
                                    </h2>

                                    <p className="text-gray-500 mt-2 max-w-xs">
                                        It is a long established fact that a reader will be distracted by the readable content.
                                    </p>
                                </div>

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                                    <FaLeaf className="text-white text-2xl" />
                                </div>

                            </div>

                        </div>
                        {/* beech wala part */}
                        <div className="flex justify-center items-center">
                            <img
                                src={FruitsVeggCat}// apni image ka path

                                className="w-80 lg:w-[400px] md:w-60 h-60 object-contain"
                            />
                        </div>

                        {/* right wala part */}


                        <div className="flex flex-col gap-20">

                            {/* Food Safety */}
                            <div className="flex items-center gap-5">

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                                    <FaShieldAlt className="text-white text-2xl" />
                                </div>

                                {/* Text */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Food Safety
                                    </h2>

                                    <p className="text-gray-500 mt-2 max-w-xs">
                                        It is a long established fact that a reader will be distracted by the readable content.
                                    </p>
                                </div>

                            </div>

                            {/* 100% Organic */}
                            <div className="flex items-center gap-5">

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                                    <FaSeedling className="text-white text-2xl" />
                                </div>

                                {/* Text */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        100% Organic
                                    </h2>

                                    <p className="text-gray-500 mt-2 max-w-xs">
                                        It is a long established fact that a reader will be distracted by the readable content.
                                    </p>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default Values;