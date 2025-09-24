
import { useState, useEffect, useRef } from 'react';
import Card from "./card";
import HomeSection from "./home";
import Gallery from "./gallery";
import Testimonial from "./testimonial";
import DonationCard from "./donationCard";
import { useFirestore } from '../lib/firestoreContext'
import { db, storage } from '../config/firebaseConfig'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const HeroSection = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageToUpdate, setImageToUpdate] = useState(null);
  const { isAdmin } = useFirestore();
  const [isUploading, setIsUploading] = useState(null)
  const [updateTrigger, setUpdateTrigger] = useState(false); // State to trigger re-fetch

  const fileInputRef = useRef(null); // Ref to file input for programmatic access

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/data?catagory=counter');
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
  }, [updateTrigger]);
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
  const handleImageClick1 = (image) => {
    // Add additional checks or modifications as needed
    const updatedImage = { ...image, id: image.id || 'default-id', counter: image.catagory };
    setImageToUpdate(updatedImage);
    fileInputRef.current?.click();
  };

  return (
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
      <HomeSection />
      <div className="relative flex flex-row flex-wrap gap-1 lg:mt-28 lg:justify-center">
        {images.map((image, index) => (
          <>
            <Card
              key={index}
              imageUrl={image.url}
              imageType={image.name}
              count={Math.random() * 7}
              name={image.name}
              description={image.description}
              isAdmin={isAdmin}
              handleFileChange={handleFileChange}
              fileInputRef={fileInputRef}
              handleImageClick1={() => handleImageClick1(image)}
            />

          </>
        ))}
      </div>
      <DonationCard />
      <Gallery />
      <div className='md:mt-64 sm:mt-48 mt-40 '>
        <Testimonial />
      </div>
    </div>
  );
};

export default HeroSection;