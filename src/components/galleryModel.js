import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

function GalleryModal({ showModal, setShowModal, currentItem, onPrev, onNext, swipeHandlers }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlayPause = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "ArrowLeft") {
        onPrev();
      } else if (event.key === "ArrowRight") {
        onNext();
      } else if (event.key === "Escape") {
        setShowModal(false);
      } else if (event.key === " " && videoRef.current) {
        event.preventDefault();
        togglePlayPause(event);
      }
    };

    if (showModal) {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showModal, onPrev, onNext, setShowModal, isPlaying]);

  useEffect(() => {
    setIsPlaying(true);
  }, [currentItem]);

  if (!showModal) return null;

  const isVideo = currentItem.type === "video";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-100">
      <div
        className="relative w-full h-full flex items-center justify-center"
        {...swipeHandlers}
        onClick={isVideo ? togglePlayPause : undefined}
      >
        {isVideo ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={currentItem.url}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
              // onPlay={() => setIsPlaying(true)}
              // onPause={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <Image
            unoptimized
            src={currentItem.url}
            alt="Modal Content"
            className="max-w-full max-h-full object-contain"
            width={1000}
            height={1000}
          />
        )}

        {/* Close button for desktop */}
        <button
          className="absolute top-4 right-4 text-white text-4xl hidden md:block z-20"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <IoMdCloseCircleOutline />
        </button>

        {/* Back button for mobile */}
        <button
          className="absolute top-4 left-4 text-white text-3xl md:hidden z-20"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <IoArrowBack />
        </button>

        {/* Navigation buttons */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl z-20 hidden md:block"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          style={{ outline: "none" }}
        >
          <FaChevronLeft />
        </button>
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl z-20 hidden md:block"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          style={{ outline: "none" }}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}

export default GalleryModal;