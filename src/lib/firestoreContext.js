"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const FirestoreContext = createContext({});

export function FirestoreProvider({ children }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const querySnapshot = await getDocs(collection(db, 'media'));
        const dataList = querySnapshot.docs.map(doc => doc.data());
        setData(dataList);
        
        const adminStatus = false; 
        console.log('Fetched Admin Status:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <FirestoreContext.Provider value={{ data, loading, error, isAdmin }}>
      
      {children}
    </FirestoreContext.Provider>
  );
}

export function useFirestore() {
  return useContext(FirestoreContext);
}
