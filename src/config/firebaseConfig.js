import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD-OpabB-KhrdGXfKhAhEw4oLlEEYv8784",
  authDomain: "zaheerwelfareservices.firebaseapp.com",
  projectId: "zaheerwelfareservices",
  storageBucket: "zaheerwelfareservices.appspot.com",
  messagingSenderId: "739376413415",
  appId: "1:739376413415:web:2450669eaf3e29abd3c042",
  measurementId: "G-KKF65VPNKQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export { db };