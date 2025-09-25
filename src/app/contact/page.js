"use client"
import React from 'react'
import Image from "next/image";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { db, storage } from '../../config/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirestore } from '../../lib/firestoreContext';
import { FaYoutube, FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { keywords as keyword, metaData } from '@/utils/seo';
import Link from 'next/link';
import useIsMobile from '@/hooks/useIsMobile';

// export const metadata = {
//   title: metaData.contact.title,
//   description: metaData.contact.description,
//   keywords: keyword
// };

const Page = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageToUpdate, setImageToUpdate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false); // New state for upload indicator
  const [imageLoading, setImageLoading] = useState(true);

  const { isAdmin } = useFirestore();
  const fileInputRef = useRef(null); // Ref to file input for programmatic access
  const isMobile = useIsMobile()

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/data?page=contact');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setImages(data);
      } catch (error) {
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && imageToUpdate) {
      setSelectedFile(file);
      setIsUploading(true)
      try {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        console.log('File uploaded:', uploadResult);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log('Download URL:', downloadURL);

        // Update the Firestore document
        const { id, name, page } = imageToUpdate;
        console.log('Updating Firestore with:', { id, name, page });

        const q = query(collection(db, 'media'),
          where('name', '==', name),
          where('page', '==', page)
        );
        const querySnapshot = await getDocs(q);
        console.log('Firestore query result:', querySnapshot.empty);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (docSnapshot) => {
            const docRef = docSnapshot.ref;
            console.log('Document reference:', docRef.id);

            try {
              await updateDoc(docRef, { url: downloadURL });
              console.log(`Updated document ${docRef.id} with new URL: ${downloadURL}`);

              // Update the state to reflect the change
              setImages(prevImages =>
                prevImages.map((img) =>
                  img.id === id ? { ...img, url: downloadURL } : img
                )
              );
            } catch (updateError) {
              console.error('Error updating document:', updateError);
            }
          });
        } else {
          console.error('No document found with the provided name and page');
        }
      } catch (error) {
        console.error('Error handling file change:', error);
        setError('Error updating image. Check console for details.');
      } finally {
        setSelectedFile(null);
        setIsUploading(false)
      }
    }
  };

  const handleImageClick = (image) => {
    setImageToUpdate(image); // Pass the entire image object
    fileInputRef.current?.click(); // Trigger the file input click programmatically
  };
  useEffect(() => {
    setTimeout(() => {
      setImageLoading(false);
    }, 100);
  }, []);

  return (
    <>
      <div className="px-5 md:px-12 lg:px-32">
        {isUploading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            <div className="relative flex flex-col items-center justify-center z-10">
              <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
              <p className="mt-4 text-white">Updating...</p>
            </div>
          </div>
        )}
        {imageLoading ? (

          <div className="relative w-full md:h-[500px] mt-20 bg-[#BFBFBF] animate-pulse">
          </div>) : (

          <div className="relative w-full md:h-[500px] mt-20">
            {images.length > 0 && (
              <div>
                {isMobile && <Image
                  width={200}
                  height={500}
                  className="w-full md:h-[500px] object-cover rounded-md"
                  src={images[0].url}
                  alt={images[0].name || "Contact Image"}
                />}
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
                      onClick={() => handleImageClick(images[0])}
                    >
                      <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.5" d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" />
                        <path d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z" stroke="#1C274C" />
                        <path opacity="0.5" d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9" stroke="#1C274C" />
                      </svg>                                </button>
                  </div>
                )}
              </div>
            )}
            <div className="absolute hidden md:block  left-2 opacity-60 rounded-md" />
            {!isMobile ? (<div className="relative w-full h-[400px]">
              {/* Background Image */}
              <Image
                src="https://arynews-1313565080.cos.ap-singapore.myqcloud.com/zip-archives/wp-content/uploads/2018/06/charity.jpg"   // agar image public folder me hai (public/needy.png)
                alt="Needy Child"
                width={500}        // required
                height={400}       // required
                 className="w-full h-full object-cover bg-top rounded-lg"
              />

              {/* Dark Overlay for readability */}
              <div className="absolute inset-0 bg-black/50 rounded-lg"></div>

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                  Contact
                </h2>
                <p className="mt-4 text-lg md:text-2xl text-[#FF9A00] italic font-medium drop-shadow-md">
                  Get in Touch
                </p>
              </div>
            </div>)
              : (
                <div className="absolute inset-0 hidden md:flex  justify-center   items-center lg:justify-start md:ml-28">
                  <h2 className="text-xl mt-5 md:text-4xl font-semibold text-[#FF165D] mb-3">Contact </h2>
                  <p className='text-[#FF9A00] text-3xl  mt-16 italic'>Get in Touch</p>
                </div>
              )}
          </div>
        )}
        <section className=" mt-10 mb-10" id="contact">
          <div className="mx-auto max-w-7xl w-full  px-4 mt-5 py-5 sm:px-6 lg:px-2 lg:py-20 ">
            <div className="mb-4 lg:w-full">
              <div className="mb-6 max-w-3xl text-center sm:text-center md:mx-auto md:mb-12">
                <div className=" bg-[#FF165D]  mx-auto w-10 h-1 mb-3 rounded-lg "> </div>
                <p className="text-base  text-blue font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-200">
                  Contact
                </p>
                <h2 className="text-xl mt-5 md:text-4xl font-semibold text-[#FF165D] px-5 mb-3">
                  Get in Touch
                </h2>
                <p className="mx-auto  text-black mt-4 max-w-3xl text-xl ">
                  Looking to volunteer or voice a concern?
                </p>
              </div>
            </div>
            <div className="lg:w-full h-full w-full items-stretch ">
              <div className="lg:w-full h-full  lg:flex lg:flex-row  ">
                <div className="h-full w-full lg:w-1/2 lg:pl-10  lg:mt-10 lg:pt-20  ">
                  <ul className="mb-6 md:mb-0">
                    <li className="flex">
                      <div className="flex h-5 mt-1 w-10 items-center  justify-center rounded bg-blue-900 text-[#3EC1D3]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          className="h-6 w-6">
                          <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                          <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-4 mb-4">
                        <h3 className="mb-2 text-2xl font-medium leading-6 text-gray-900 text-[#3EC1D3]">
                          Our Address
                        </h3>
                        <p className="text-black">
                          fatima manzil street no 2 , xyz
                        </p>
                        <p className="text-black">
                          pakistan
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="flex h-5 mt-1 w-10 items-center justify-center rounded bg-blue-900 text-[#3EC1D3]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          className="h-6 w-6">
                          <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"></path>
                          <path d="M15 7a2 2 0 0 1 2 2" />
                          <path d="M15 3a6 6 0 0 1 6 6" />
                        </svg>
                      </div>
                      <div className="ml-4 mb-4">
                        <h3 className="mb-2 text-2xl font-medium leading-6 text-gray-900 text-[#3EC1D3] ">
                          Contact
                        </h3>
                        <p className="text-black">
                          Mobile: +92 319 400 2407
                        </p>
                        <p className="text-black">
                          Mail: zaheerwelfaretrust@gmail.com
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="flex h-5 mt-1 w-10 items-center justify-center rounded bg-blue-900 text-[#3EC1D3]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          className="h-6 w-6">
                          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                          <path d="M12 7v5l3 3" />
                        </svg>
                      </div>
                      <div className="ml-4 mb-4">
                        <h3 className="mb-2 text-2xl font-medium leading-6 text-gray-900 text-[#3EC1D3]">
                          Working hours
                        </h3>
                        <p className="text-black">
                          Monday - Friday: 08:00 - 17:00
                        </p>
                        <p className="text-black">
                          Saturday &amp; Sunday: 08:00 - 12:00
                        </p>
                      </div>
                    </li>
                  </ul>
                  <div>
                    <p className='text-xl mt-5 md:text-4xl font-semibold text-[#FF165D] mb-3'>follow us on social media</p>
                    <div className="flex items-center space-x-4 mt-5">
                      <Link href="https://www.instagram.com/zaheerwelfare/" target='_blank' className="text-blue-900">
                        <FaInstagram color='#3EC1D3' size={25} />
                      </Link>
                      <Link href="https://www.facebook.com/profile.php?id=61560178871297" target='_blank' className="text-blue-900">
                        <FaFacebook color='#3EC1D3' size={25} />
                      </Link>
                      {/* <Link href="#" className="text-blue-900">
                        <FaXTwitter color='#3EC1D3' size={25} />
                      </Link> */}
                    </div>
                  </div>
                </div>
                <div className="card w-full h-fit lg:w-1/2 md:p-5 lg:mt-9  mt-12 " id="form">
                  <div className="relative w-[100%]  h-2/3 md:h-1/2   lg:h-full sm:mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-brown shadow-lg transform md:-skew-y-3 rotate-2 -skew-y-2    rounded-3xl    sm:rounded-3xl"></div>
                    <div className=" relative  hidden lg:block bg-[#E178C5] shadow-lg sm:rounded-3xl rounded-lg -rotate-3   p-4">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11672.945750644447!2d-122.42107853750231!3d37.7730507907087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858070cc2fbd55%3A0xa71491d736f62d5c!2sGolden%20Gate%20Bridge!5e0!3m2!1sen!2sus!4v1619524992238!5m2!1sen!2sus"
                        width="100%"
                        height={480}
                        style={{ border: 0, margin: 'auto', borderRadius: '10px', outline: 'none' }}
                        allowFullScreen=""
                        loading="lazy" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative  bg-[#E178C5] shadow-lg lg:hidden  rounded-3xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11672.945750644447!2d-122.42107853750231!3d37.7730507907087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858070cc2fbd55%3A0xa71491d736f62d5c!2sGolden%20Gate%20Bridge!5e0!3m2!1sen!2sus!4v1619524992238!5m2!1sen!2sus"
              width="100%"
              height={380}
              style={{ border: 0, margin: 'auto', outline: 'none' }}
              loading="lazy" />
          </div>
        </section>
      </div>
    </>
  )
}
export default Page