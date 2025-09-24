import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export default async function handler(req, res) {
  try {
    // Optionally handle query parameters for filtering
    const {catagory } = req.query; 
    const {page } = req.query; // Example: ?page=home

    
    let mediaQuery = collection(db, 'media');
    
    if (catagory) {
      mediaQuery = query(mediaQuery, where('catagory', '==', catagory));

    }
    if (page) {
      mediaQuery = query(mediaQuery, where('page', '==', page));

    }
    
    const querySnapshot = await getDocs(mediaQuery);
    const dataList = querySnapshot.docs.map(doc => doc.data());
    
    res.status(200).json(dataList);
  } catch (error) {
    // console.error('Error fetching Firestore data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
