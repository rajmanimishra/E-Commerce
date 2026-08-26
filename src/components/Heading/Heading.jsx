import React from 'react'

const Heading = (props) => {
    return (
        <div className=' py-3 md: w-fit mx-auto '>
            <h2 className=' md:text-4xl font-bold'> <span className='text-orange-500 '>{props.highlight} </span>{props.heading}</h2>
            <div className='w-[100px] border-t-3 rounded-3xl border-yellow-500 my-5 ml-auto leading-[1]'></div>
        </div>
    )
}

export default Heading;