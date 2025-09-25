'use client'

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { metaData } from "@/utils/seo";
import log from "../assets/images/log.png";
import { FaXTwitter } from "react-icons/fa6";
import { Roboto } from "next/font/google";
import { MapPin, Phone, Mail } from 'lucide-react';
import useIsMobile from "@/hooks/useIsMobile";


export const metadata = {
  title: metaData.footer.title,
  description: metaData.footer.description,
};

const Footer = () => {
   const isMobile = useIsMobile()

  return (
    <div className="bg-[#b5e7ed] md:items-center    md:flex-col w-full px-5 md:px-16 overflow-hidden md:flex gap-3 lg:px-8 justify-between text-black">
      <div className="-mb-7 -mt-7">
        <div className="flex flex-col   md:flex-row justify-around">
          <div className="flex flex-col  md:w-[27%] sm:ml-8  md:items-start items-center   py-10  md:py-10 md:mt-10 lg:mt-5">
            <Image
              src={log}
              alt="My Image"
              width={100}
              height={100}
              className="  " />
            <p className="text-[16px] pt-3 w-full md:text-start text-center  whitespace-normal break-normal ">
              Over the past few months, the Zaheer Welfare Foundation has carved a remarkable path in the heart of Fatima Manzil, XYZ. With a vision rooted in compassion and service, we continue to uplift lives, strengthen communities, and spread hope where it’s needed most.
            </p>


          </div>
          
          <div className="flex md:w-[59%] md:flex-row flex-col    justify-evenly  ">
           <div className="flex md:w-[50%] w-[100%] md:px-0 px-7 md:bg-[#b5e7ed]     justify-between md:justify-evenly ">
             <div className={` flex flex-col ${!isMobile ? 'items-start' : ''} gap-0   md:w-[45%] py-4 md:py-10 md:mt-28 lg:mt-5`}>
              <h2 className="text-xl  font-semibold text-[#EF1E60]">
                Our Campaigns
              </h2>
              <div className="flex  flex-col items-start pt-5">
                <ul className=" space-y-3  text-white">
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `} >
                      Qurbani
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `} >
                      Zakat
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `}>
                      Fitrana
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `}>
                      Old Age Home
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `}>
                      Orphanage
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `}>
                      Ambulance
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>

                </ul>
              </div>
            </div>
            <div className={` flex flex-col ${!isMobile ? '' : 'items-start'} gap-0  md:w-[45%] py-4 md:py-10 md:mt-28 lg:mt-5`}>
              <h2 className="  text-xl  font-semibold text-[#EF1E60]">
                Our Services
              </h2>
              <div className=" flex flex-col pt-5">
                <ul className=" space-y-3 text-white">
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `} >
                      Free Medical Camps
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `} >
                      Free Education
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `}>
                      Free Dastarkhwan
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `}>
                      Free IT Lab
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                  <li className="relative group">
                    <Link
                      href="#"
                      className={`text-black  underline-offset-8 decoration-4 decoration-rose-500 hover:decoration-gap-2 transition-all duration-300 ease-in-out hover:text-[#EF1E60] `}>
                      Free Diagnostic lab
                    </Link>
                    <div className="absolute left-0 w-0 h-[3px] bg-[#EF1E60] transition-all duration-300 ease-in-out group-hover:w-full"></div>
                  </li>
                </ul>
              </div>
            </div>
           </div>
            <div className="flex  flex-col md:-ml-4 md:px-0 px-7     md:pt-10 mt-0 pb-3 md:w-[40%] w-[100%] md:mt-28  lg:mt-5 ">
              <ul>

                <h3 className={`text-xl  font-bold -mt-[10px] ${isMobile ? 'text-center ' : ''}     py-3 text-[#EF1E60]`}> Contact Info </h3>
                <div className="mt-5"></div>
                <div className="relative  mb-10 flex items-center justify-evenly">
                  <Phone size={19} className="absolute left-0 " />
                  <p className="text-start absolute left-8  ">+92 319 400 2407</p>
                </div>
                <div className={`relative ${!isMobile ? 'mb-14' : 'mb-10'}  flex items-center justify-evenly`}>
                  <Mail size={19} className="absolute left-0 " />
                  <p className="text-start absolute left-8  ">zaheerwelfaretrust@gmail.com</p>
                </div>
                <div className="relative mb-10 flex items-center justify-evenly">
                  <MapPin size={19} className="absolute left-0" />
                  <p className="text-start absolute left-8  " >Fatima manzil block 06 {!isMobile && <br />} Avenue Town, xyz</p>
                </div>

                <form>
                  <div className="flex w-full mt-10  ">
                    <label
                      htmlFor="search-dropdown"
                      className="text-sm font-medium text-gray-900 sr-only dark:text-white">
                      Your Email
                    </label>
                    <div className="relative w-[100%] md:w-full">
                      <input
                        type="input"
                        id="search-dropdown"
                        className="block py-3 outline-none rounded-md p-2.5 w-full  text-sm text-black bg-gray-50 rounded-e-lg rounded-s-gray-100 rounded-s-2  focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:border-blue-500"
                        placeholder="Email Address"
                        required />
                      <button
                        type="submit"
                        className="absolute px-2 py-3 bg-[#EF1E60] w-[30%] md:w-[40%]  lg:w-[30%] text-center font-semibold outline-none text-white top-0 end-0 p-1.5 h-full text-sm bg-blue-700 rounded-e-lg hover:bg-blue-800  focus:outline-none  dark:bg-blue-600 dark:hover:bg-blue-700 ">
                        SUBMIT
                      </button>
                    </div>
                  </div>
                </form>
              </ul>
            </div>
          </div>

        </div>
      </div>

      <div className=" md:border-t sm:border-none border-[#EF1E60] w-[89%] md:flex-row flex-col flex items-center justify-between py-6  ">
        <div className="text-sm text-center md:text-left ml-7 md:ml-0 mb-3  mt-3 font-semibold">
          © 2020 All rights reserved | Made with
          <span className="text-[#EF1E60]"> ♥</span> by
          <Link href="https://www.nitensclue.com/" target="_blank" className="text-[#EF1E60] transition"> Nitensclue</Link>
        </div>
        <div className={`${isMobile && 'mt-5'} flex gap-x-6   items-center justify-center `}>
          <Link href="https://www.facebook.com/profile.php?id=61560178871297" target='_blank' className="text-blue-900">
            <FaFacebook color="#EF1E60" size={22} className="cursor-pointer hover:transition-all duration-250 ease-in-out " />
          </Link>
          <Link href="https://www.instagram.com/zaheerwelfare/" target='_blank' className="text-blue-900">
            <FaInstagram color="#EF1E60" size={22} className="cursor-pointer" />
          </Link>
          <FaXTwitter color="#EF1E60" size={22} className="cursor-pointer" />
          <FaYoutube color="#EF1E60" size={22} className="cursor-pointer" />
        </div>

      </div>

    </div>

  );
};

export default Footer;
