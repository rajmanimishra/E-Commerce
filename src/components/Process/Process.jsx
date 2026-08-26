import React from "react";
import {
  FaLeaf,
  FaIndustry,
  FaAward,
  FaTruck,
} from "react-icons/fa";

const processData = [
  {
    id: 1,
    title: "Sourcing",
    icon: <FaLeaf />,
    desc: "selecting reliable suppliers and vendors to procure fresh, high-quality grocery products at competitive prices. It ensures consistent product availability, quality, and timely delivery for customers.",
    position: "lg:mt-48",
  },
  {
    id: 2,
    title: "Manufacturing",
    icon: <FaIndustry />,
    desc: "producing, processing, and packaging grocery products before they are made available for sale. It ensures products meet quality, safety, and hygiene standards before reaching customers.",
    position: "lg:mt-0",
  },
  {
    id: 3,
    title: "Quality Control",
    icon: <FaAward />,
    desc: "inspecting and testing grocery products to ensure they meet quality, freshness, and safety standards. It helps maintain customer satisfaction by delivering reliable and defect-free products.",
    position: "lg:mt-48",
  },
  {
    id: 4,
    title: "Logistics",
    icon: <FaTruck />,
    desc: "managing the storage, transportation, and delivery of grocery products from suppliers to customers. It ensures timely, safe, and efficient order fulfillment.",
    position: "lg:mt-0",
  },
];

const Process = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold">
            <span className="text-orange-500">Our</span>{" "}
            <span className="text-gray-800">Process</span>
          </h2>

          <div className="w-28 h-1 bg-orange-400 mt-3"></div>
        </div>

        {/* Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {processData.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col items-center text-center ${item.position}`} >

              {/* Step Number */}
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center mb-8">
                <div className="w-14 h-14 rounded-full border-4 border-gray-700 flex items-center justify-center text-3xl font-bold">
                  {item.id}
                </div>
              </div>

              {/* Icon + Text */}
              <div className="flex items-start gap-4 text-left">

                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl flex-shrink-0">
                  {item.icon}
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="text-gray-500 mt-2 leading-7">
                    {item.desc}
                  </p>
                </div>

              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Process;