
import React, { useState } from 'react';
import { useFirestore } from '@/lib/firestoreContext'; 
import { storage } from '@/config/firebaseConfig'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

const ImageEditor = ({ imageId, currentImageUrl }) => {
  const { updateImage } = useFirestore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newUrl, setNewUrl] = useState(currentImageUrl);
  const [metadata, setMetadata] = useState({}); // Metadata for Firestore

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedImage) return;

    setUploading(true);

    const storageRef = ref(storage, `images/${selectedImage.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedImage);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
      },
      (error) => {
        console.error('Upload error:', error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setNewUrl(downloadURL);

        // Update Firestore with new image URL and metadata
        try {
          await updateImage(imageId, {
            url: downloadURL,
            ...metadata
          });
          setUploading(false);
        } catch (error) {
          console.error('Firestore update error:', error);
          setUploading(false);
        }
      }
    );
  };

  return (
    <div>
      <Image 
           src={newUrl}  
        alt="Current"
        width={500}        
        height={400}       
         style={{ width: '100px', height: '100px' }}
      />
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Update Image'}
      </button>
      {/* Add additional fields for metadata as needed */}
    </div>
  );
};

export default ImageEditor;
