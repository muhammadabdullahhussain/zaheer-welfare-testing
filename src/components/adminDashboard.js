"use client"
import React, { useState } from 'react';
import { useFirestore } from '../lib/firestoreContext';

const AdminDashboard = () => {
  const { data, loading, error, updateImage, setIsAdmin } = useFirestore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [newData, setNewData] = useState({});

  // Mock admin check (replace with real auth logic)
  const checkAdminStatus = async () => {
    // Simulate admin check
    const isAdmin = true; // Replace with actual admin check
    setIsAdmin(isAdmin);
  };

  React.useEffect(() => {
    checkAdminStatus();
  }, [setIsAdmin]);

  const handleUpdate = async () => {
    if (selectedImage) {
      try {
        await updateImage(selectedImage.id, newData);
        alert('Image updated successfully');
      } catch (error) {
        alert(`Failed to update image: ${error.message}`);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        {data.map(img => (
          <div key={img.id} onClick={() => setSelectedImage(img)}>
            <img src={img.url} alt={img.title} width={100} />
            <p>{img.title}</p>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div>
          <h2>Editing: {selectedImage.title}</h2>
          <input
            type="text"
            placeholder="New Title"
            value={newData.title || ''}
            onChange={(e) => setNewData({ ...newData, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="New URL"
            value={newData.url || ''}
            onChange={(e) => setNewData({ ...newData, url: e.target.value })}
          />
          <button onClick={handleUpdate}>Update Image</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
