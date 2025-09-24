"use client";
import React from "react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { db, storage } from "../../config/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useFirestore } from "../../lib/firestoreContext";
import { FaQuoteLeft } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

import { keywords as keyword, metaData } from "@/utils/seo";
import Button from "@/components/button";

// export const metadata = {
//   title: metaData.about.title,
//   description: metaData.about.description,
//   keywords: keyword
// };

const Page = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageToUpdate, setImageToUpdate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { isAdmin } = useFirestore();
  const fileInputRef = useRef(null); // Ref to file input for programmatic access
  const [isUploading, setIsUploading] = useState(false); // New state for upload indicator
  const [imageLoading, setImageLoading] = useState(true);
  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch("/api/data?page=about");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setImages(data);
      } catch (error) {
        setError("Failed to load images");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);
  useEffect(() => {
    setTimeout(() => {
      setImageLoading(false);
    }, 100);
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && imageToUpdate) {
      setSelectedFile(file);
      setIsUploading(true); // Start loading indicator

      try {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        console.log("File uploaded:", uploadResult);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Download URL:", downloadURL);

        // Update the Firestore document
        const { id, name, page } = imageToUpdate;
        const q = query(
          collection(db, "media"),
          where("name", "==", name),
          where("page", "==", page)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          await Promise.all(
            querySnapshot.docs.map(async (docSnapshot) => {
              const docRef = docSnapshot.ref;
              try {
                await updateDoc(docRef, { url: downloadURL });
                console.log(
                  `Updated document ${docRef.id} with new URL: ${downloadURL}`
                );
              } catch (updateError) {
                console.error("Error updating document:", updateError);
              }
            })
          );

          // Fetch updated images from Firestore
          const response = await fetch("/api/data?page=about");
          const data = await response.json();
          setImages(data);
        } else {
          console.error("No document found with the provided name and page");
        }
      } catch (error) {
        console.error("Error handling file change:", error);
        setError("Error updating image. Check console for details.");
      } finally {
        setIsUploading(false); // Stop loading indicator
        setSelectedFile(null); // Clear the file input after upload
      }
    }
  };
  const handleImageClick = (image) => {
    setImageToUpdate(image);
    fileInputRef.current?.click();
  };
  return (
    <div className="px-5 md:px-12 lg:px-32 mb-10">
      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <div className="relative flex flex-col items-center justify-center z-10">
            <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
            <p className="mt-4 text-white">Updating...</p>
          </div>
        </div>
      )}
      <section className="container mx-auto p-10 md:py-10 px-0 md:p-10 md:px-0">
        <section className="relative  lg:w-full mx-auto md:p-0 w-full rounded-md overflow-hidden lg:bg-white transform duration-500 cursor-pointer hover:-translate-y-1 ">
          {imageLoading ? (
            <div className="md:w-[100%]  md:h-[400px] lg:h-[500px] w-full bg-[#BFBFBF] animate-pulse"></div>
          ) : (
            <div className="md:w-[100%]  md:h-[400px] lg:h-[500px] w-full">
              {images.length > 0 && (
                <div>
                  <Image
                    width={1000}
                    height={1000}
                    src={images[0].url} // Dynamic Image
                    alt={images[0].name || "About Image"}
                    className="object-cover lg:rounded-md w-[100%] h-[300px]  md:w-full md:h-[100%]"
                  />
                  {isAdmin && (
                    <div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <button
                        className="absolute top-2 right-2 bg-[#F6F7D7] p-2 rounded-full z-50"
                        onClick={() => handleImageClick(images[0])}
                      >
                        <svg
                          width="15px"
                          height="15px"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            opacity="0.5"
                            d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
                            stroke="#1C274C"
                          />
                          <path
                            d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z"
                            stroke="#1C274C"
                          />
                          <path
                            opacity="0.5"
                            d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9"
                            stroke="#1C274C"
                          />
                        </svg>{" "}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div
            className="content p-3   md:w-[100%] bg-[#B5E7ED] lg:rounded-tr-3xl  pt-8 md:p-12 pb-12 lg:max-w-lg w-full lg:absolute top-20 left-5"
            data-aos="fade-left"
          >
            <div className="flex justify-between  italic   font-bold  text-[#FF9A00] text-xl">
              <p>What We Do...</p>
            </div>
            <h2 className="text-xl mt-5 md:text-4xl font-semibold text-[#FF165D] mb-3">
              About our Organization
            </h2>
            <p className="my-3 text-justify  font-medium text-black leading-relaxed">
              Our mission is to support you. Additionally, we&apos;ve
              established a clinic specializing in top-notch treatment for
              hepatitis patients, ensuring the best care possible for those
              affected
            </p>
            <Button>Read More</Button>
          </div>
        </section>
      </section>
      <>
        <div className="w-full mb-0 rounded-md">
          <div className="relative w-full mb-10 flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl shadow-lg p-3  md:max-w-3xl mx-auto">
            <div className="w-full md:w-1/2   grid place-items-center">
              <div className="wrapper bg-gray-400 antialiased text-gray-900">
                <div>
                  {images.length > 0 && (
                    <div>
                      <Image
                        width={300}
                        height={300}
                        src={images[1].url} // Dynamic Image
                        alt={images[1].name || "Random Image"}
                        className="object-cover bg-contain rounded-lg shadow-md"
                      />
                      {isAdmin && (
                        <div>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden" // Hide the file input
                            ref={fileInputRef} // Attach the ref
                          />
                          <button
                            className="absolute top-2 right-2 bg-[#F6F7D7] p-2 rounded-full z-50"
                            onClick={() => handleImageClick(images[1])}
                          >
                            <svg
                              width="15px"
                              height="15px"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                opacity="0.5"
                                d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
                                stroke="#1C274C"
                              />
                              <path
                                d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z"
                                stroke="#1C274C"
                              />
                              <path
                                opacity="0.5"
                                d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9"
                                stroke="#1C274C"
                              />
                            </svg>{" "}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="relative px-4 -mt-8  ">
                    <div className="bg-[#3EC1D3]  p-2 rounded-lg shadow-lg">
                      <h4 className="mt-1 ">
                        <FaQuoteLeft />
                        Charity makes no decrease in property
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3 flex flex-col space-y-2 p-3">
              <div className="flex justify-between item-center">
                <p className="text-black font-bold hidden md:block">About Us</p>
              </div>
              <h3 className="text-xl mt-5 md:text-4xl font-semibold text-[#FF165D] mb-3">
                Safe the patient
              </h3>
              <p className="md:text-lg text-black text-base">
                Solutions to Help People in Need.believes every child deserves a
                future.
              </p>
              <p className="text-xl font-black text-gray-800">
                $110
                <span className="font-normal text-gray-600 text-base">
                  /night
                </span>
              </p>
              <div className="mt-8 mx-auto md:mx-0 ">
                <Button>Be a Sponsor</Button>
              </div>
            </div>
          </div>
        </div>
      </>
      <div className="flex flex-col lg:flex-row w-full">
        <div className="relative flex lg:mt-10 mb-5 lg:mb-0 w-full rounded-md lg:w-1/2 flex-col justify-center overflow-hidden bg-gray-50  lg:py-12">
          <div className="group relative cursor-pointer overflow-hidden bg-[#9de5ef] px-6  mt-0 pt-10 pb-8 shadow-xl  hover:bg-[#3EC1D3] transition-all  duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
            <span className="absolute top-2 z-0 h-20 w-20 rounded-full  transition-all duration-300 group-hover:scale-[10]" />
            <div className="relative z-10 mx-auto max-w-md">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-[#3EC1D3] transition-all duration-300 group-hover:bg-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-10 w-10 text-black hover:text-black transition-all"
                >
                  <path
                    strokeLinejoin="round"
                    d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </span>
              <div className="space-y-6 pt-5 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-black">
                <p>
                  Our mission is to support you. Additionally, we&apos;ve
                  established a clinic specializing in top-notch treatment for
                  hepatitis patients, ensuring the best care possible for those
                  affected.
                </p>
              </div>
              <div className="p-3 mt-3 text-base font-semibold bg-white hover:bg-white rounded-3xl leading-7">
                <div className="text-black  text-center transition-all duration-300 group-hover:text-black">
                  20000+ people helped
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 w-full md:w-full lg:mt-4 lg:p-7 ">
          <div className="leading-relaxed">
            <h2 className="text-xl mt-5 md:text-4xl font-semibold text-[#FF165D] mb-3">
              Our Goal
            </h2>
            <p className="mt-4 text-justify text-black">
              Our goal is simple: to ensure that every patient receives the
              highest standard of treatment and support throughout their journey
              towards health and recovery. With a team of experienced
              professionals and cutting-edge facilities, we strive to provide
              comprehensive care that addresses the unique needs of each
              individual, empowering them to lead healthier and more fulfilling
              lives.
            </p>
            <div className="flex flex-col flex-wrap md:flex-row w-full mt-5 mb-8 gap-2">
              <div className="flex flex-row w-[70%] mx-auto  md:w-[35%] lg:w-[40%]  gap-1 justify-start lg:pl-2 align-middle mt-1 bg-[#9de5ef] rounded-3xl md:py-2 py-2 p-3 md:px-1">
                <FaCheckCircle className="my-auto" color="#FF165D" />
                <p className="text-sm my-auto">Make Donation </p>
              </div>
              <div className="flex flex-row w-[70%] mx-auto  md:w-[35%] lg:w-[40%]  gap-1 justify-start lg:pl-2 align-middle mt-1 bg-[#9de5ef] rounded-3xl md:py-2 py-2 p-3 md:px-1">
                <FaCheckCircle className="my-auto" color="#FF165D" />
                <p className="text-sm my-auto">Become A Volunteer</p>
              </div>
              <div className="flex flex-row w-[70%] mx-auto   md:w-[35%] lg:w-[40%]  gap-1 justify-start lg:pl-2 align-middle mt-1 bg-[#9de5ef] rounded-3xl md:py-2 py-2 p-3 md:px-1">
                <FaCheckCircle className="my-auto" color="#FF165D" />
                <p className="text-sm my-auto">Donation Reached 10M</p>
              </div>
              <div className="flex flex-row  w-[70%] mx-auto  md:w-[35%] lg:w-[40%]  gap-1 justify-start lg:pl-2 align-middle mt-1 bg-[#9de5ef] rounded-3xl md:py-2 py-2 p-3 md:px-1">
                <FaCheckCircle className="my-auto" color="#FF165D" />
                <p className="text-sm my-auto">Food For Poor</p>
              </div>
              <div className="flex flex-row w-[70%] mx-auto  md:w-[35%] lg:w-[40%]  gap-1 justify-start lg:pl-2 align-middle mt-1 bg-[#9de5ef] rounded-3xl md:py-2 py-2 p-3 md:px-1">
                <FaCheckCircle className="my-auto" color="#FF165D" />
                <p className="text-sm my-auto">Education For ALl</p>
              </div>
              <div className="flex flex-row w-[70%] mx-auto  md:w-[35%] lg:w-[40%]  gap-1 justify-start lg:pl-2 align-middle mt-1 bg-[#9de5ef] rounded-3xl md:py-2 py-2 p-3 md:px-1">
                <FaCheckCircle className="my-auto" color="#FF165D" />
                <p className="text-sm my-auto">Hospitals For Patient</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default Page;
