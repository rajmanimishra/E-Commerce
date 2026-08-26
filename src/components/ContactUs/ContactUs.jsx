import React, { useState } from "react";
import { Link } from "react-router-dom";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    setSent(true);

    setForm({
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const info = [
    {
      icon: "📍",
      title: "Our Address",
      text: "42 Greenfield Market Road, Lucknow, UP 226001",
    },
    {
      icon: "📞",
      title: "Call Us",
      text: "+91 9988047018",
    },
    {
      icon: "✉️",
      title: "Email Us",
      text: "hello@grocify.com",
    },
    {
      icon: "🕒",
      title: "Working Hours",
      text: "Mon - Sat : 7:00 AM - 9:00 PM",
    },
  ];

  return (
    <div className="pt-24">

      {/* Banner */}

      <section className="bg-orange-50 py-16 text-center">
        <h1 className="text-4xl font-bold">Contact Us</h1>

        <p className="mt-3 text-gray-500">
          <Link to="/" className="text-orange-500 font-semibold">
            Home
          </Link>{" "}
          / Contact Us
        </p>
      </section>

      {/* Contact */}

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">

        {/* Left */}

        <div>
          <span className="bg-orange-100 text-orange-500 px-5 py-2 rounded-full text-sm font-semibold">
            Get In Touch
          </span>

          <h2 className="text-4xl font-bold mt-6">
            We'd Love To Hear
            <span className="text-orange-500"> From You</span>
          </h2>

          <p className="text-gray-500 mt-5 leading-7">
            Questions about an order or delivery? Send us a message and we'll
            reply within 24 hours.
          </p>

          <div className="mt-10 space-y-6">
            {info.map((item, index) => (
              <div key={index} className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex justify-center items-center text-xl">
                  {item.icon}
                </div>

                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-gray-500">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}

        <div className="bg-orange-50 rounded-2xl p-8">

          {sent ? (
            <div className="text-center py-10">

              <div className="text-5xl">✅</div>

              <h2 className="text-2xl font-bold mt-4">
                Message Sent Successfully
              </h2>

              <p className="text-gray-500 mt-3">
                We'll contact you very soon.
              </p>

              <button
                onClick={() => setSent(false)}
                className="mt-6 text-orange-500 font-semibold"
              >
                Send Another Message
              </button>

            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="grid sm:grid-cols-2 gap-5">

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="border rounded-lg p-3 outline-none focus:border-orange-500"
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="border rounded-lg p-3 outline-none focus:border-orange-500"
                />

              </div>

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="border rounded-lg p-3 w-full outline-none focus:border-orange-500"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className="border rounded-lg p-3 w-full outline-none focus:border-orange-500"
              />

              <textarea
                rows="5"
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                className="border rounded-lg p-3 w-full resize-none outline-none focus:border-orange-500"
              ></textarea>

              <button
                type="submit"
                className="bg-gradient-to-b from-orange-400 to-orange-500 text-white px-8 py-3 rounded-full hover:scale-105 duration-300"
              >
                Send Message
              </button>

            </form>
          )}
        </div>

      </section>

    </div>
  );
};

export default ContactUs;