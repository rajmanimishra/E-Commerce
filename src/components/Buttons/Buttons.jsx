import React from 'react'

const Buttons = ({ content }) => {
    return (
        <button className='bg-linear-to-b from-orange-400 to-orange-500 text-white px-8 py-1.5 rounded-2xl text-lg hover:scale-105 cursor-pointer'>
            {content}
        </button>
    )
}

export default Buttons;