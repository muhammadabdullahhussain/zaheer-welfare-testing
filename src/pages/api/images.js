import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '../../config/firebaseConfig'

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const q = query(collection(db, "media"), where("page", "==", "gallery"));
      const querySnapshot = await getDocs(q);
      const images = querySnapshot.docs.map((doc) => doc.data());

      res.status(200).json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch images" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
