import React from "react";
import { Link } from "react-router-dom";

function AboutUs() {
  const stats = [
    { number: "12+", label: "Years of Trust" },
    { number: "500+", label: "Partner Farms" },
    { number: "50k+", label: "Happy Customers" },
  ];

  const features = [
    {
      icon: "🌱",
      title: "100% Organic",
      text: "No pesticides, no shortcuts. Naturally grown produce from trusted farms.",
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      text: "Same-day delivery so it arrives as fresh as when it was picked.",
    },
    {
      icon: "🤝",
      title: "Fair to Farmers",
      text: "We pay fair prices directly to growers, cutting out the middlemen.",
    },
  ];

  return (
    <div className="font-sans text-black pt-24">

      {/* Banner */}

      <section className="bg-orange-50 py-14 text-center">
        <h1 className="text-4xl font-extrabold">About Us</h1>

        <p className="mt-2 text-gray-500 text-sm">
          <Link to="/" className="text-orange-500 font-semibold">
            Home
          </Link>{" "}
          • About Us
        </p>
      </section>

      {/* Story */}

      <section className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-12">

        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80"
          alt="Fresh vegetables"
          className="w-full lg:w-1/2 rounded-2xl"
        />

        <div className="lg:w-1/2">

          <span className="inline-block bg-orange-100 text-orange-500 px-5 py-2 rounded-full text-sm font-semibold mb-5">
            Our Story
          </span>

          <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-5">
            Bringing Farm-Fresh
            <span className="text-orange-500"> Goodness </span>
            To Your Doorstep
          </h2>

          <p className="text-gray-500 leading-8">
            GrOcify started with a simple idea: everyone deserves easy access
            to fresh, organic fruits and vegetables. We work directly with
            local farmers to bring you produce that's picked at peak ripeness
            and delivered the same day.
          </p>

          {/* Stats */}

          <div className="flex flex-wrap gap-10 mt-10">
            {stats.map((item) => (
              <div key={item.label}>
                <h3 className="text-3xl font-bold">{item.number}</h3>
                <p className="text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>

          <Link
            to="/contact"
            className="inline-block mt-10 bg-gradient-to-b from-orange-400 to-orange-500 text-white px-8 py-3 rounded-full hover:scale-105 duration-300"
          >
            Get In Touch
          </Link>

        </div>
      </section>

      {/* Features */}

      <section className="bg-orange-50 py-16">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center">

            <span className="inline-block bg-white text-orange-500 px-5 py-2 rounded-full text-sm font-semibold mb-5">
              Why Choose Us
            </span>

            <h2 className="text-4xl font-bold">
              What Makes Us Different
            </h2>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">

            {features.map((feature) => (

              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 shadow hover:shadow-lg duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-3xl mb-5">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-500 leading-7">
                  {feature.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

    </div>
  );
}

export default AboutUs;