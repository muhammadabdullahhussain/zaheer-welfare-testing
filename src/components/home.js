import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { IoMdCloseCircleOutline } from "react-icons/io";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "./button";
import { useFirestore } from "../lib/firestoreContext";
import { db, storage } from "../config/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import useIsMobile from "@/hooks/useIsMobile";

const HomeSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [imageURL, setImageURL] = useState();
  const [hidePopUp, setHidePopUp] = useState(false);
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageToUpdate, setImageToUpdate] = useState(null);
  const { isAdmin } = useFirestore();
  const fileInputRef = useRef(null); // Ref to file input for programmatic access
  const fileInputRef2 = useRef(null); // Ref to file input for programmatic access
  const [isUploading, setIsUploading] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

    const isMobile = useIsMobile()

  const handleImageClick = (url) => {
    setImageURL(url);
    setShowModal(true);
  };
  
  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch("/api/data?page=home");
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && imageToUpdate) {
      setSelectedFile(file);
      setIsUploading(true);
      try {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        console.log("File uploaded:", uploadResult);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Download URL:", downloadURL);

        // Update the Firestore document
        const { id, name, page } = imageToUpdate;
        console.log("Updating Firestore with:", { id, name, page });

        const q = query(
          collection(db, "media"),
          where("name", "==", name),
          where("page", "==", page)
        );
        const querySnapshot = await getDocs(q);
        console.log("Firestore query result:", querySnapshot.empty);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (docSnapshot) => {
            const docRef = docSnapshot.ref;
            console.log("Document reference:", docRef.id);

            try {
              await updateDoc(docRef, { url: downloadURL });
              console.log(
                `Updated document ${docRef.id} with new URL: ${downloadURL}`
              );

              // Update the state to reflect the change
              setImages((prevImages) =>
                prevImages.map((img) =>
                  img.id === id ? { ...img, url: downloadURL } : img
                )
              );
            } catch (updateError) {
              console.error("Error updating document:", updateError);
            }
          });
        } else {
          console.error("No document found with the provided name and page");
        }
      } catch (error) {
        console.error("Error handling file change:", error);
        setError("Error updating image. Check console for details.");
      } finally {
        setSelectedFile(null);
        setIsUploading(false);
        fileInputRef.current = null;
        // Clear the file input after upload
      }
    }
  };

  const handleImageClick1 = (image) => {
    setImageToUpdate(image); // Pass the entire image object
    fileInputRef.current?.click(); // Trigger the file input click programmatically
  };
  const handleImageClick2 = (image) => {
    setImageToUpdate(image); // Pass the entire image object
    fileInputRef2.current?.click(); // Trigger the file input click programmatically
  };
  useEffect(() => {
    setTimeout(() => {
      setImageLoading(false);
    }, 100);
  }, []);
  return (
    <div>
      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          <div className="relative flex flex-col items-center justify-center z-10">
            <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
            <p className="mt-4 text-white">Updating...</p>
          </div>
        </div>
      )}
      <>
        {/* ======================== */}
        {!hidePopUp && (
          <>
            <div
              className="flex flex-col-reverse md:flex-row  bg-white fixed top-2 sm:top-10 md:top-[18%] right-0 md:right-[10%] lg:right-[12%] xl:right-[20%] md:w-[80%] lg:w-[75%] xl:w-[60%] mx-2 md:h-[65%] overflow-hidden z-50 rounded-md"
              data-aos="fade-up"
              data-aos-duration="3000"
              data-aos-offset="200"
            >
              <p
                className="bg-pink-600 text-2xl font-semibold text-black absolute z-10 top-0 right-0 md:right-0 cursor-pointer p-2"
                onClick={() => setHidePopUp(true)}
              >
                <IoMdCloseCircleOutline
                  style={{ color: "#3EC1D3" }}
                  className="text-xl md:text-3xl"
                />
              </p>
              <div className="w-full bg-[#caf4ff8d]">
                <h3 className=" text-xl mt-5 md:text-4xl font-semibold text-[#FF165D] px-5 mb-3">
                  Fundraising for a Worthy Cause{" "}
                </h3>
                <p className="text-md mt-1 text-black px-5">
                  {" "}
                  With the help of your donations we are dedicated to providing
                  support to deserving individuals, enhancing their well-being
                  and improving their quality of life.Your generosity will
                  significantly improve the lives of those in need.{" "}
                </p>
                <div className="mx-5 pt-2 lg:pt-5">
                  <Button onClick={() => router.push("/donate")}>Donate</Button>
                </div>
                <div className="bg-[#ff165cbf] md:mt-0 md:p-2 md:pb-3 md:h-14 md:w-[50%]  md:absolute md:bottom-0">
                  <p className="text-lg md:text-xl mt-2 pl-3 text-white">
                    Saving lives, Savings smiles
                  </p>
                </div>
              </div>
                <div className="w-full h-full bg-[#BFBFBF]"> 
                <div className="w-full h-full">
                  {images.length > 0 && (
                    <div className="w-full h-full">
                      <Image
                        width={20}
                        height={20}
                        src={images[7].url}
                        unoptimized
                        alt={images[7].name || "Donate Image"}
                        className="h-[250px] md:h-full overflow-hidden w-full"
                      />
                      {isAdmin && (
                        <div>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <button
                            className="absolute top-2 bg-[#F6F7D7] p-2 rounded-full"
                            onClick={() => handleImageClick1(images[5])}
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
                              />
                              <path
                                d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z"
                                stroke="#1C274C"
                              />
                              <path
                                opacity="0.5"
                                d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9"
                                stroke="#1C274C"
                              />
                            </svg>{" "}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </>
        )}
        {/* ======================== */}
             <div className="lg:relative  mb-5 md:mb-10  flex flex-col items-center lg:flex-row-reverse lg:w-full lg:mt-10 xl:w-full">
             {imageLoading ? (

       <div className="w-full h-64 lg:w-1/2 lg:h-auto hover:cursor-pointer bg-primary"> </div> ):(

          <div className="w-full h-64 lg:w-1/2 lg:h-auto hover:cursor-pointer">
            {images.length > 0 && (
              <div>
              {isMobile &&   <Image
                  width={50}
                  height={50}
                  unoptimized
                  className="lg:h-[600px] h-full w-full lg:mx-auto object-cover rounded-md "
                  src={images[15].url}
                  alt={images[15].name || "Food For Poor"}
                  data-aos="fade-right"
                  data-aos-duration="3000"
                  data-aos-offset="200"
                  onClick={() => {
                    setShowModal(true);
                    handleImageClick(images[15].url);
                  }}
                />}
                {isAdmin && (
                  <div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={fileInputRef2}
                    />
                    <button
                      className="absolute top-2 right-2 bg-[#F6F7D7] p-2 rounded-full"
                      onClick={() => handleImageClick2(images[15])}
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
                        />
                        <path
                          d="M17.3009 2.80624L16.652 3.45506L10.6872 9.41993C10.2832 9.82394 10.0812 10.0259 9.90743 10.2487C9.70249 10.5114 9.52679 10.7957 9.38344 11.0965C9.26191 11.3515 9.17157 11.6225 8.99089 12.1646L8.41242 13.9L8.03811 15.0229C7.9492 15.2897 8.01862 15.5837 8.21744 15.7826C8.41626 15.9814 8.71035 16.0508 8.97709 15.9619L10.1 15.5876L11.8354 15.0091C12.3775 14.8284 12.6485 14.7381 12.9035 14.6166C13.2043 14.4732 13.4886 14.2975 13.7513 14.0926C13.9741 13.9188 14.1761 13.7168 14.5801 13.3128L20.5449 7.34795L21.1938 6.69914C22.2687 5.62415 22.2687 3.88124 21.1938 2.80624C20.1188 1.73125 18.3759 1.73125 17.3009 2.80624Z"
                          stroke="#1C274C"
                        />
                        <path
                          opacity="0.5"
                          d="M16.6522 3.45508C16.6522 3.45508 16.7333 4.83381 17.9499 6.05034C19.1664 7.26687 20.5451 7.34797 20.5451 7.34797M10.1002 15.5876L8.4126 13.9"
                          stroke="#1C274C"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
          {isMobile &&   <div
            className="max-w-full lg:bg-[#e2f2f6] lg:z-10 lg:right-0 md:shadow-lg lg:absolute lg:top-0 md:mt-20 lg:w-3/5 lg:-left-5  lg:mt-20 lg:ml-20 xl:mt-24 xl:ml-12"
            data-aos="fade-right"
          >
            <div className="flex flex-col md:p-12 md:px-10 lg:py-16">
              <h2 className="text-2xl text-[#3EC1D3] md:w-[100%] font-semibold capitalize text-green-800 lg:text-4xl">
                Welcome to
                <span className="text-[#FF9A00] mx-1">Zaheer Welfare</span>
              </h2>
              <p className="text-2xl text-[#EF1E60] font-semibold capitalize text-green-800 lg:text-4xl inline">
                Saving <span className="typewriter text-[#3FC0D4]"></span>{" "}
              </p>
              <p className="mt-4 pt-3 text-justify text-black">
                We aim to serve poor people in Pakistan, including helpless
                individuals, orphans, street children, widows, and those
                affected by disasters, providing basic human needs like food,
                shelter, and medical care. Our mission is to provide free
                education to needy individuals, focusing on religious education
                that develops personal growth and character formation, striving
                to save lives and transform communities.
              </p>
              <div className="mt-8 lg:mb-0 mb-6 mx-auto md:mx-0 ">
                <Link href="/about"><Button>Learn More</Button></Link>
                <Modal
                  showModal={showModal}
                  setShowModal={setShowModal}
                  imageURL={imageURL}
                />
              </div>
            </div>
          </div> }
        </div>
      </>
    </div>
  );
};

export default HomeSection;
