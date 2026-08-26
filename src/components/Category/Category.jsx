import React from 'react'
import Heading from '../Heading/Heading';
import FruitsVeggCat from '../../assets/fruits-and-veggies.png'
import DairyEggsCat from '../../assets/dairy-and-eggs.png'
import MeatSeaFoodCat from '../../assets/meat-and-seafood.png'
import { Link } from 'react-router-dom'

const Category = () => {
    const renderCards = category.map((cards) => {
        return (
            <div key={cards.id} className='flex-1 '>
                <div className="h-64 overflow-hidden">
                    <img src={cards.image} className="w-full h-full object-cover" />
                </div>

                <div className='bg-zinc-100 p-6.25'>
                    <h3 className='text-3xl font-bold '>{cards.title}</h3>
                    <p className='text-zinc-600 mt-2 mb-5'>{cards.description}</p>
                    <Link to={cards.path} className='bg-linear-to-b from-orange-400 to-orange-500 text-white px-8 py-1.5 rounded-2xl text-lg hover:scale-105 cursor-pointer '>See All</Link>
                </div>

            </div>

        )
    })
    return (
        <section>
            <div className='py-10  max-w-350 mx-auto px-10 '>
                <Heading highlight='Shop' heading='by Category' />
                {/* Category Cards */}
                <div className=' flex gap-10 mt-15 flex-wrap'>
                    {/* //this is calling */}
                    {renderCards}
                </div>
            </div>

        </section>
    )
}

export default Category;


const category = [
    {
        id: 1,
        title: "Fruits & Veggies",
        description: 'Fresh, organic produce sourced daily from local farms. Explore a wide range of seasonal fruits and crisp vegetables',
        image: FruitsVeggCat,
        path: '/fruits',


    },
    {
        id: 2,
        title: "Dairy & Eggs",
        description: 'Wholesome dairy products and free-range eggs. From creamy milk and yogurt to artisanal cheeses',
        image: DairyEggsCat,
        path: '/dairy',


    },
    {
        id: 3,
        title: "Meat & SeaFood",
        description: 'High-quality, responsibly sourced meat and seafood. Choose from fresh cuts, marinated options, and more',
        image: MeatSeaFoodCat,
        path: '/seafood',

    },

]