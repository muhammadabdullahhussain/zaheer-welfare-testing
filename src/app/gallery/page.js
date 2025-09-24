// Page.js
"use client";
import Modal from "@/components/Modal";
import Image from "next/image";
import { IoMdCloseCircleOutline } from "react-icons/io";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useState, useEffect, useRef } from "react";
import { useFirestore } from "../../lib/firestoreContext";
import { db, storage } from "../../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useSwipeable } from 'react-swipeable';
import GalleryModal from "@/components/galleryModel";

function Page() {
  const [showModal, setShowModal] = useState(false);
  const [imageURL, setImageURL] = useState();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageToUpdate, setImageToUpdate] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { isAdmin } = useFirestore();
  const fileInputRef = useRef(null);
  const newFileInputRef = useRef(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch("/api/data?page=gallery");
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
      setIsUploading(true);

      try {
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        console.log("File uploaded:", uploadResult);

        const downloadURL = await getDownloadURL(storageRef);
        console.log("Download URL:", downloadURL);

        const { name, page } = imageToUpdate;
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

          const response = await fetch("/api/data?page=gallery");
          const data = await response.json();
          setImages(data);
        } else {
          console.error("No document found with the provided name and page");
        }
      } catch (error) {
        console.error("Error handling file change:", error);
        setError("Error updating image. Check console for details.");
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
    }
  };

  const handleNewFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsUploading(true);

      try {
        const storageRef = ref(storage, `media/${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        console.log("File uploaded:", uploadResult);

        const downloadURL = await getDownloadURL(storageRef);
        console.log("Download URL:", downloadURL);

        const newMedia = {
          url: downloadURL,
          name: file.name,
          page: "gallery",
          type: file.type.startsWith('video') ? 'video' : 'image'
        };
        await addDoc(collection(db, "media"), newMedia);
        console.log("New media added to Firestore:", newMedia);

        const response = await fetch("/api/data?page=gallery");
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error("Error handling file change:", error);
        setError("Error uploading media. Check console for details.");
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
    }
  };

  // const handleVideoClick = (video) => {
  //   setCurrentVideo(video);
  //   setShowVideoModal(true);
  // };
  const handleImageClick = (item) => {
    setImageToUpdate(item);
    fileInputRef.current?.click(); 
  };
  const handleItemClick = (item, index) => {
    setCurrentImageIndex(index);
    setShowModal(true);
  };
  
  const handlePrevItem = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : images.length - 1
    );
  };
  
  const handleNextItem = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < images.length - 1 ? prevIndex + 1 : 0
    );
  };
   
  const handlers = useSwipeable({
    onSwipedLeft: handleNextItem,
    onSwipedRight: handlePrevItem,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const SkeletonLoader = () => {
    return (
      <div className="animate-pulse flex flex-col space-y-2 md:space-y-4 ">
        <div className="flex md:space-x-2 space-y-2 flex-col  md:flex-row  ">
          <div className="md:h-72 h-48 w-[100%]  md:w-1/3 bg-[#BFBFBF] rounded-md animate-pulse"></div>
          <div className="md:h-72 h-48 w-[100%]  md:w-1/3 bg-[#BFBFBF] rounded-md animate-pulse"></div>
          <div className="md:h-72 h-48 w-[100%]  md:w-1/3 bg-[#BFBFBF] rounded-md animate-pulse"></div>
        </div>
        <div className="flex md:space-x-2 space-y-2 flex-col  md:flex-row ">
          <div className="md:h-72 h-48 w-[100%]  md:w-1/3 bg-[#BFBFBF] rounded-md animate-pulse"></div>
          <div className="md:h-72 h-48 w-[100%]  md:w-1/3 bg-[#BFBFBF] rounded-md animate-pulse"></div>
          <div className="md:h-72 h-48 w-[100%]  md:w-1/3 bg-[#BFBFBF] rounded-md animate-pulse"></div>
        </div>
        <div className="flex md:space-x-2 space-y-2 flex-col  md:flex-row ">
          <div className="md:h-72 h-48 w-[100%]  md:w-1/3 bg-[#BFBFBF] rounded-md animate-pulse"></div>
          <div className="md:h-72 h-48 w-[100%]  md:w-1/3 bg-[#BFBFBF] rounded-md animate-pulse"></div>
          <div className="md:h-72 h-48 w-[100%]  md:w-1/3 bg-[#BFBFBF] rounded-md animate-pulse"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-5 pb-6 pt-10 md:px-12 lg:px-32 relative">
      <div className="relative bg-[url('https://firebasestorage.googleapis.com/v0/b/zaheerwelfareservices.appspot.com/o/images%2FZaheer_Welfare_Photos__page-0062_xscmut.jpg?alt=media&token=1a67da49-6b30-41ec-95e1-481e0a40bfdb')] bg-cover  bg-center md:h-[70vh] h-[30vh] mb-20">

        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl` md:text-5xl font-extrabold tracking-wide drop-shadow-lg">
            Recent Events
          </h1>
          <p className="mt-3 text-lg md:text-xl text-gray-200">
            Home <span className="mx-2">&larr;</span> Gallery
          </p>
        </div>
      </div>  

      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <div className="relative flex flex-col items-center justify-center z-10">
            <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
            <p className="mt-4 text-white">Updating...</p>
          </div>
        </div>
      )}
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <input
            type="file"
            onChange={handleNewFileChange}
            className="hidden"
            ref={newFileInputRef}
            accept="image/*,video/*"
          />
          <button
            className="bg-blue p-2 rounded-xl text-white font-semibold"
            onClick={() => newFileInputRef.current?.click()}
          >
            Add Media
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonLoader />
      ) : (
        <ResponsiveMasonry columnsCountBreakPoints={{ 650: 1, 750: 2, 1024: 3 }}>
          <Masonry gutter="8px" transitionDuration={0}>
            {images
              .slice()
              .reverse()
              .map((item, index) => (
                <div key={index} className="relative p-1 w-[100%] h-[100%]">
                  {item.type === 'video' ? (
                    <div className="relative group w-full h-0 pb-[56.25%] cursor-pointer"    
                         onClick={() => handleItemClick(item, images.length - 1 - index)}
                    >
                      <video
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                        // src={`${item.url}?v=${new Date().getTime()}`}
                        src={item.url}
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                        <svg className="w-16 h-16 text-white opacity-75 hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" fillRule="evenodd"></path>
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-md"></div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="relative group w-[100%] h-[100%] cursor-pointer"
                        onClick={() => handleItemClick(item, images.length - 1 - index)}
                      >
                        <Image
                          unoptimized
                          width={500}
                          height={100}
                          className="w-[100%] h-[100%] rounded-md object-cover"
                          // src={`${item.url}?v=${new Date().getTime()}`}
                          src={item.url}
                          alt={item.name || `Gallery Image ${index + 1}`}
                          priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-md"></div>
                      </div>
                    </>
                  )}
                  {isAdmin && (
                    <div className="absolute top-2 right-2">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <button
                        className="bg-[#F6F7D7] p-2 rounded-full z-50"
                        onClick={() => handleImageClick(item)}
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
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z"
                            stroke="#1C274C"
                            strokeWidth="1.5"
                          />
                          <path
                            opacity="0.5"
                            d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9"
                            stroke="#1C274C"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </Masonry>
        </ResponsiveMasonry>
      )}
   <GalleryModal
  showModal={showModal}
  setShowModal={setShowModal}
  currentItem={images[currentImageIndex]}
  onPrev={handlePrevItem}
  onNext={handleNextItem}
  swipeHandlers={handlers}
/>
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-100">
          <div className="relative w-full h-full">
            <video
              src={currentVideo?.url}
              className="w-full h-full"
              controls
              autoPlay
            />
            <IoMdCloseCircleOutline
              style={{ color: "#fff" }}
              className="absolute top-4 right-4 text-xl md:text-3xl cursor-pointer"
              onClick={() => setShowVideoModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;