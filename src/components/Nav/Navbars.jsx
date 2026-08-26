// Navbars.jsx

import React, { useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { IoSearch } from "react-icons/io5";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";

function Navbars() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();


  const handleSearch = () => {

    if (search.trim() !== "") {

      navigate(`/allproducts?search=${search.toLowerCase()}`);
      setMenuOpen(false);

    } else {

      navigate("/allproducts");

    }

  };


  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setMenuOpen(false);
  };


  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">

      <nav className="max-w-7xl h-20 mx-auto flex justify-between items-center px-5">


        {/* Logo */}

        <Link
          to="/"
          className="text-2xl font-extrabold"
        >
          Gr
          <span className="text-orange-500 text-[35px]">
            o
          </span>
          cify
        </Link>



        {/* Desktop Menu */}

        <ul className="hidden md:flex items-center gap-10">

          <li>
            <Link
              to="/"
              className="font-semibold hover:text-orange-500"
            >
              Home
            </Link>
          </li>


          <li>
            <Link
              to="/about"
              className="font-semibold hover:text-orange-500"
            >
              About Us
            </Link>
          </li>


          <li>
            <Link
              to="/processes"
              className="font-semibold hover:text-orange-500"
            >
              Process
            </Link>
          </li>


          <li>
            <Link
              to="/contact"
              className="font-semibold hover:text-orange-500"
            >
              Contact Us
            </Link>
          </li>


        </ul>



        {/* Desktop Right Section */}

        <div className="hidden md:flex items-center gap-4">


          {/* Search */}

          <div className="rounded-full border-2 border-orange-500 flex items-center overflow-hidden">


            <input

              type="text"

              placeholder="Search products..."

              value={search}

              onChange={(e) => setSearch(e.target.value)}

              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  handleSearch();
                }

              }}

              className="w-52 px-4 py-2 outline-none"

            />


            <button

              onClick={handleSearch}

              className="h-11 w-11 bg-gradient-to-b from-red-600 to-orange-500 text-white flex justify-center items-center"

            >

              <IoSearch />

            </button>


          </div>



          {/* Icons */}

          <button className="text-2xl hover:text-orange-500">

            <AiFillHeart />

          </button>


          <button className="text-2xl hover:text-orange-500">

            <RiShoppingBag4Fill />

          </button>


          {/* Logout */}

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600"
          >
            Logout
          </button>


        </div>



        {/* Mobile Menu Button */}

        <button

          onClick={() => setMenuOpen(!menuOpen)}

          className="md:hidden text-3xl"

        >

          {
            menuOpen
              ?
              <HiX />
              :
              <HiMenu />
          }


        </button>


      </nav>




      {/* Mobile Menu */}

      {
        menuOpen &&

        <div className="md:hidden bg-white border-t shadow-lg">


          <div className="p-5 flex flex-col gap-5">



            {/* Mobile Search */}


            <div className="rounded-full border-2 border-orange-500 flex items-center overflow-hidden">


              <input

                type="text"

                placeholder="Search products..."

                value={search}

                onChange={(e) => setSearch(e.target.value)}

                onKeyDown={(e) => {

                  if (e.key === "Enter") {
                    handleSearch();
                  }

                }}

                className="flex-1 px-4 py-2 outline-none"

              />


              <button

                onClick={handleSearch}

                className="h-11 w-11 bg-gradient-to-b from-red-600 to-orange-500 text-white flex justify-center items-center"

              >

                <IoSearch />

              </button>


            </div>




            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>



            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
            >
              About Us
            </Link>



            <Link
              to="/processes"
              onClick={() => setMenuOpen(false)}
            >
              Process
            </Link>



            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
            >
              Contact Us
            </Link>



            <div className="flex gap-6 text-2xl">


              <button>
                <AiFillHeart />
              </button>


              <button>
                <RiShoppingBag4Fill />
              </button>


            </div>


            {/* Mobile Logout */}

            <button
              onClick={handleLogout}
              className="w-fit px-4 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600"
            >
              Logout
            </button>


          </div>


        </div>

      }


    </header>
  );
}


export default Navbars;