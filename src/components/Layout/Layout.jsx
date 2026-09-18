
import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../Nav/Navbars";
import Footer from "../Footer/Footer";
import ScrollToTop from "../ScrollToTop/ScrollToTop";
import AIChatbot from "../AIChatbot/AIChatbot";

const Layout = () => {
    return (
        <>
            <ScrollToTop />

            <Navbar />

            <main>
                <Outlet />
            </main>

            <Footer />

            <AIChatbot />
        </>
    );
};

export default Layout;

