
import Grocery from '../../assets/grocery.png';
import { Link } from "react-router-dom";

const Hero = () => {
    return (
        <section className="py-25">
            <div className="max-w-350 mx-auto px-5 md:px-10 flex flex-col md:flex-row items-center ">

                {/* hero content */}
                <div className="flex-1 text-center md:text-left order-1">
                    <span className="bg-orange-100 rounded-full px-5 py-2 text-orange-500 text-shadow-lg inline-block">
                        Export Best Quality...
                    </span>

                    <h1 className="text-4xl md:text-6xl md:leading-[1.2] font-bold mt-4">
                        Tasty Organic
                        <span className="text-orange-500"> Fruits</span> &
                        <span className="text-orange-500"> Veggies</span>
                        <br className="hidden md:block" />
                        In Your City
                    </h1>

                    <p className="text-zinc-600 text-sm md:text-[15px] py-1 my-4 max-w-132.5 mx-auto md:mx-0">
                        Bread for a high content of beneficial substances. Our products are all fresh and healthy.
                    </p>

                    <Link
                        to="/allproducts"
                        className="bg-linear-to-b from-orange-400 to-orange-500 text-white px-8 py-1.5 rounded-2xl text-lg hover:scale-105 transition inline-block cursor-pointer"> Shop Now </Link>
                </div>

                {/* hero image */}
                <div className="flex-1 flex justify-center order-2">
                    <img
                        src={Grocery}
                        alt="Hero image"
                        className="w-full max-w-75 md:max-w-137.5"
                    />
                </div>

            </div>
        </section>
    );
};

export default Hero;