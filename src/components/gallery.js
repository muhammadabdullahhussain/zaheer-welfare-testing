"use client"
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Button from './button';
import { useFirestore } from '../lib/firestoreContext';
import { db, storage } from '../config/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

function Gallery() {
    const [showModal, setShowModal] = useState(false);
    const [imageURL, setImageURL] = useState();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageToUpdate, setImageToUpdate] = useState(null);
    const [updateTrigger, setUpdateTrigger] = useState(false); // State to trigger re-fetch
    const { isAdmin } = useFirestore();
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(null)

    useEffect(() => {
        async function fetchImages() {
            try {
                const response = await fetch('/api/data?catagory=homeslider');
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
    }, [updateTrigger]); // Refetch images whenever updateTrigger changes

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && imageToUpdate) {
            setSelectedFile(file);
            setIsUploading(true);
            try {
                const storageRef = ref(storage, `images/${file.name}`);
                const uploadResult = await uploadBytes(storageRef, file);
                console.log('File uploaded:', uploadResult);

                const downloadURL = await getDownloadURL(storageRef);
                console.log('Download URL:', downloadURL);

                const { id, name, page, catagory } = imageToUpdate;
                if (!id || !name || !page || !catagory) throw new Error('Required fields are missing');

                const q = query(
                    collection(db, 'media'),
                    where('name', '==', name),
                    where('page', '==', page),
                    where('catagory', '==', catagory)
                );

                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    for (const docSnapshot of querySnapshot.docs) {
                        const docRef = docSnapshot.ref;
                        await updateDoc(docRef, { url: downloadURL });
                        console.log(`Updated document ${docRef.id} with new URL: ${downloadURL}`);

                        setImages((prevImages) =>
                            prevImages.map((img) =>
                                img.id === id ? { ...img, url: downloadURL } : img
                            )
                        );
                    }
                } else {
                    console.error('No document found with the provided fields');
                }

                // Trigger image refetch
                setUpdateTrigger((prev) => !prev);

            } catch (error) {
                console.error('Error handling file change:', error);
                setError('Error updating image. Check console for details.');
            } finally {
                setSelectedFile(null);
                setIsUploading(false)
            }
        } else {
            console.error('File or imageToUpdate is missing');
        }
    };
    const handleImageClick = (url) => {
        setImageURL(url);
        setShowModal(true);
    };

    const handleImageClick1 = (image) => {
        const updatedImage = { ...image, id: image.id || 'default-id', homeslider: image.catagory };
        setImageToUpdate(updatedImage);
        fileInputRef.current?.click();
    };


    return (
        <div className='flex w-full lg:flex-row flex-col mt-10 lg:mt-32 lg:mb-40 relative md:mt-10 md:mb-20'>
            {isUploading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="absolute inset-0 backdrop-blur-sm"></div>
                    <div className="relative flex flex-col items-center justify-center z-10">
                        <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
                        <p className="mt-4 text-white">Updating...</p>
                    </div>
                </div>
            )}
            <div className="sm:max-w-lg w-full lg:w-[40%] mb-16 lg:mb-10 ">
                <h2 className="text-xl mt-5 md:text-4xl font-semibold text-[#FF165D] mb-3">
                    Meet Charity
                    Projects
                </h2>
                <p className="mt-4 md:text-xl text-black mb-10 text-balance">
                    Our organization is dedicated to providing a range of essential services, including financial support, sustenance, shelter, education and healthcare to vulnerable populations. Additionally we are committed to facilitating marriage arrangements for helpless females and providing support for individuals with disabilities.                </p>
               <Link href='/donate'><Button>Donate Now</Button></Link>
            </div>
            <div className="transform  w-full md:h-screen lg:w-[50%] lg:left-1/2  lg:mt-60 md:mt-36 lg:absolute lg:-translate-y-1/2 lg:translate-x-8">
                <div className="flex flex-col sm:flex-row items-center justify-center mx-auto space-x-3 lg:space-x-1">
                    <div className="grid flex-shrink-0  lg:grid-cols-1 gap-y-3 lg:gap-y-2">
                        <div className=" relative h-auto w-auto sm:h-64 sm:w-40 overflow-hidden rounded-lg sm:opacity-100 lg:opacity-100  ">
                            {images.length > 0 && (
                                <>
                                    <Image
                                        src={images[0].url}
                                        alt={images[0].name || "Free Food"}
                                        width={224}
                                        height={336}
                                        unoptimized
                                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500 ease-in-out  hover:translate-y-3 hover:cursor-pointer"
                                        onClick={() => {
                                            handleImageClick(images[0].url)
                                            setShowModal(true)
                                        }}

                                    />
                                    {isAdmin && (
                                        <>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden" // Hide the file input
                                                ref={fileInputRef} // Attach the ref
                                            />
                                            <button
                                                className="absolute top-2 right-2 bg-[#F6F7D7] p-2 rounded-full z-50"
                                                onClick={() => handleImageClick1(images[0])}
                                            >
                                                <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.5" d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" />
                                                    <path d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z" stroke="#1C274C" />
                                                    <path opacity="0.5" d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9" stroke="#1C274C" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="h-auto w-auto sm:h-64 sm:w-40 overflow-hidden rounded-lg relative">
                            {images.length > 0 && (
                                <>

                                    <Image
                                        src={images[1].url}
                                        alt={images[1].name || "Free Education"}
                                        width={224}
                                        height={336}
                                        unoptimized
                                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500 ease-in-out  hover:translate-y-3 hover:cursor-pointer"
                                        onClick={() => {
                                            handleImageClick(images[1].url)
                                            setShowModal(true)
                                        }}
                                        priority
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
                                                onClick={() => handleImageClick1(images[1])}
                                            >
                                                <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.5" d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" />
                                                    <path d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z" stroke="#1C274C" />
                                                    <path opacity="0.5" d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9" stroke="#1C274C" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="grid flex-shrink-0 grid-cols-1 gap-y-1 lg:gap-y-2">
                        <div className="relative h-auto w-auto sm:h-60 sm:w-40 overflow-hidden rounded-lg">
                            {images.length > 0 && (
                                <>
                                    <Image
                                        src={images[2].url}
                                        alt={images[2].name || "Free Hospital"}
                                        width={224}
                                        height={336}
                                        unoptimized
                                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500 ease-in-out  hover:translate-y-3 hover:cursor-pointer"
                                        onClick={() => {
                                            handleImageClick(images[2].url)
                                            setShowModal(true)
                                        }}
                                    />
                                    {isAdmin && (
                                        <>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden" // Hide the file input
                                                ref={fileInputRef} // Attach the ref
                                            />
                                            <button
                                                className="absolute top-2 right-2 bg-[#F6F7D7] p-2 rounded-full z-50"
                                                onClick={() => handleImageClick1(images[2])}
                                            >
                                                <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.5" d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" />
                                                    <path d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z" stroke="#1C274C" />
                                                    <path opacity="0.5" d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9" stroke="#1C274C" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </>

                            )}
                        </div>
                        <div className="relative h-auto w-auto sm:h-60 sm:w-40 overflow-hidden rounded-lg">
                            {images.length > 0 && (
                                <>
                                    <Image
                                        src={images[3].url}
                                        alt={images[3].name || "charity Programs"}
                                        width={224}
                                        height={336}
                                        unoptimized
                                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500 ease-in-out  hover:translate-y-3 hover:cursor-pointer"
                                        onClick={() => {
                                            handleImageClick(images[3].url)
                                            setShowModal(true)
                                        }}
                                    />
                                    {isAdmin && (
                                        <>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden" // Hide the file input
                                                ref={fileInputRef} // Attach the ref
                                            />
                                            <button
                                                className="absolute top-2 right-2 bg-[#F6F7D7] p-2 rounded-full z-50"
                                                onClick={() => handleImageClick1(images[3])}
                                            >
                                                <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.5" d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" />
                                                    <path d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z" stroke="#1C274C" />
                                                    <path opacity="0.5" d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9" stroke="#1C274C" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div className=" relative h-auto w-auto sm:h-60 sm:w-40 overflow-hidden rounded-lg">
                            {images.length > 0 && (
                                <>
                                    <Image
                                        src={images[4].url}
                                        alt={images[4].name || "Free Food"}
                                        width={224}
                                        height={336}
                                        unoptimized
                                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500 ease-in-out  hover:translate-y-3 hover:cursor-pointer"
                                        onClick={() => {
                                            handleImageClick(images[4].url)
                                            setShowModal(true)
                                        }}
                                    />
                                    {isAdmin && (
                                        <>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden" // Hide the file input
                                                ref={fileInputRef} // Attach the ref
                                            />
                                            <button
                                                className="absolute top-2 right-2 bg-[#F6F7D7] p-2 rounded-full z-50"
                                                onClick={() => handleImageClick1(images[4])}
                                            >
                                                <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.5" d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" />
                                                    <path d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z" stroke="#1C274C" />
                                                    <path opacity="0.5" d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9" stroke="#1C274C" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="relative grid flex-shrink-0 grid-cols-1 gap-y-1 lg:gap-y-2">
                        <div className="h-auto w-auto sm:h-64 sm:w-40 overflow-hidden rounded-lg">
                            {images.length > 0 && (
                                <>
                                    <Image
                                        src={images[5].url}
                                        alt={images[5].name || "family support programs"}
                                        width={224}
                                        height={336}
                                        unoptimized
                                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500 ease-in-out  hover:translate-y-3 hover:cursor-pointer"
                                        onClick={() => {
                                            handleImageClick(images[5].url)
                                            setShowModal(true)
                                        }}
                                    />
                                    {isAdmin && (
                                        <>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden" // Hide the file input
                                                ref={fileInputRef} // Attach the ref
                                            />
                                            <button
                                                className="absolute top-2 right-8 bg-[#F6F7D7] p-2 rounded-full z-50"
                                                onClick={() => handleImageClick1(images[5])}
                                            >
                                                <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.5" d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" />
                                                    <path d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z" stroke="#1C274C" />
                                                    <path opacity="0.5" d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9" stroke="#1C274C" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="relative h-auto w-auto sm:h-64 sm:w-40 overflow-hidden rounded-lg">
                            {images.length > 0 && (
                                <>
                                    <Image
                                        src={images[6].url}
                                        alt={images[6].name || "welfare Program"}
                                        width={224}
                                        height={336}
                                        unoptimized
                                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500 ease-in-out  hover:translate-y-3 hover:cursor-pointer"
                                        onClick={() => {
                                            handleImageClick(images[6].url)
                                            setShowModal(true)
                                        }}
                                    />
                                    {isAdmin && (
                                        <>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden" // Hide the file input
                                                ref={fileInputRef} // Attach the ref
                                            />
                                            <button
                                                className="absolute top-2 right-8 bg-[#F6F7D7] p-2 rounded-full z-50"
                                                onClick={() => handleImageClick1(images[6])}
                                            >
                                                <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path opacity="0.5" d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" />
                                                    <path d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z" stroke="#1C274C" />
                                                    <path opacity="0.5" d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9" stroke="#1C274C" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Modal showModal={showModal} setShowModal={setShowModal} imageURL={imageURL} />
        </div>
    )
}

export default Gallery;
