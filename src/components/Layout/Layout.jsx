import React from 'react'
import Navbars from '../Nav/Navbars'
import { Outlet } from "react-router-dom";
import Footer from '../Footer/Footer';
import ScrollToTop from "../ScrollToTop/ScrollToTop";


const Layout = () => {
    return (
        <div>

            <ScrollToTop />
            <Navbars />
            <Outlet />
            <Footer />


        </div>
    )
}

export default Layout