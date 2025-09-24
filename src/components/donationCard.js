"use client";
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image';
import { useFirestore } from '../lib/firestoreContext'
import { db, storage } from '../config/firebaseConfig'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DonationCard = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageToUpdate, setImageToUpdate] = useState(null);
  const { isAdmin } = useFirestore();
  const fileInputRef = useRef(null); // Ref to file input for programmatic access
  const [isUploading, setIsUploading] =useState(null)
  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/data?page=home');
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

  const handleImageClick1 = (image) => {
    setImageToUpdate(image);
    fileInputRef.current?.click(); 
  };

  return (
    <>
      <div className="mt-16 lg:mt-28">
      {isUploading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="absolute inset-0 backdrop-blur-sm"></div>
                    <div className="relative flex flex-col items-center justify-center z-10">
                        <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
                        <p className="mt-4 text-white">Updating...</p>
                    </div>
                </div>
            )}
            
        <div className="relative w-auto">
          {images.length > 0 && (
            <>
              <div className="relative w-full h-0 pb-[45%]">
                <Image
                  src={images[0].url} 
                  alt={images[0].name || "hero-image"}
                  layout="fill"
                  className='object-cover'
                />
              </div>
              {isAdmin && (
                <div className="absolute top-2 right-2">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden" ref={fileInputRef} />
                  <button
                    className="bg-[#F6F7D7] p-2 rounded-full z-50"
                    onClick={() => handleImageClick1(images[0])}
                  >
                    <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path opacity="0.5" d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#1C274C" strokeWidth="1.5" />
                      <path d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z" stroke="#1C274C"/>
                      <path opacity="0.5" d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9" stroke="#1C274C" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default DonationCard;
