'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import PracticeNavbar from './practiceNavbar'
import { Link } from 'lucide-react'
import Modal from './Modal'
import { Button } from 'antd'
import useIsMobile from '@/hooks/useIsMobile'

const HomeSectionHero = () => {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  return (
    <>
      {pathname === '/' && !isMobile ? (<div className="z-0 bg-[url('https://preview.colorlib.com/theme/lovecare/images/bg_1.jpg.webp')] bg-cover bg-center h-screen w-screen left-0 ">
        <PracticeNavbar />
        <div
          className="max-w-full relative z-30 md:absolute top-0 left-0  lg:z-10 lg:right-0  lg:absolute lg:top-0 md:mt-20 lg:w-3/5 lg:-left-5  lg:mt-20 lg:ml-20 xl:mt-24 xl:ml-12"
        // data-aos="fade-right"
        >
          <div className="flex flex-col md:p-12 md:px-10 md:mt-20 lg:py-16">
            <h2 className="text-2xl text-[#3EC1D3] md:w-[100%] font-semibold capitalize text-green-800 lg:text-4xl">
              Welcome to
              <span className="text-[#FF9A00] mx-1">Zaheer Welfare</span>
            </h2>
            <p className="text-2xl text-[#EF1E60] font-semibold capitalize text-green-800 lg:text-4xl inline">
              Saving <span className="typewriter text-[#3FC0D4]"></span>{" "}
            </p>
            <p className="mt-1 pt-1 text-justify max-w-[80%] text-[#c5bcbc]">
              We aim to serve poor people in Pakistan, including helpless
              individuals, orphans, street children, widows, and those
              affected by disasters, providing basic human needs like food,
              shelter, and medical care. Our mission is to provide free
              education to needy individuals, focusing on`` religious education
              that develops personal growth and character formation, striving
              to save lives and transform communities.
            </p>
            <div className="mt-3 lg:mb-0 mb-6 mx-auto md:mx-0 ">
              <Button className='bg-blue text-white'>Learn More</Button>
              {/* <Modal
                  showModal={showModal}
                  setShowModal={setShowModal}
                  imageURL={imageURL}
                /> */}
            </div>
          </div>
        </div>
      </div>) : (
        <>
          <PracticeNavbar />

        </>
      )}
    </>
  )
}

export default HomeSectionHero
