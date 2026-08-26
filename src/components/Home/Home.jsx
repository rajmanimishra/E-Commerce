import React from 'react';
import Navbars from '../Nav/Navbars';
import Hero from '../Hero/Hero';
import Category from '../Category/Category';
import Values from '../Vaules/Values';
import Products from '../Products/Products';
import Discount from '../Discount/Discount';
import Process from '../Process/Process';
import Testimonials from '../Testimonial/Testimonial';


const Home = () => {
    return (
        <>

            <Hero />
            <Category />
            <Values />
            <Products />
            <Discount />
            <Process />
            <Testimonials />


        </>
    )
}

export default Home;
