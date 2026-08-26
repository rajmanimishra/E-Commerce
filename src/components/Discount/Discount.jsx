import React from 'react'
import Buttons from '../Buttons/Buttons';
import Fruits from '../../assets/fresh-fruits.png'


const Discount = () => {
    return (
        <div className=" bg-zinc-100  flex justify-evenly items-center p-10">
            <span className='text-5xl transform -rotate-90 md:text-7xl text-orange-500 font-bold mb-10'>20%</span>
            <div>
                <h1 className=' text-5xl     md:text-7xl font-bold'>First Order <br />Discount!</h1>
                <p className='text-zinc-700 '>Enjoy an exclusive first order discount on our grocery website! Shop fresh essentials and save big <br />on your first purchase. Fast delivery and quality guaranteed.

                </p>
                <div className='mt-10'><Buttons content="Get a Discount" /></div>

            </div>
            <div
                className="hidden sm:block md:w-full h-100 bg-cover bg-center"
                style={{ backgroundImage: `url(${Fruits})` }} >

            </div>

        </div>
    )
}

export default Discount;