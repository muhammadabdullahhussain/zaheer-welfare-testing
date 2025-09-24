"use client"

import React, { useEffect } from "react";
import { FirestoreProvider } from "@/lib/firestoreContext";

import HeroSection from "@/components/heroSection";

import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Home() {

  useEffect(() => {AOS.init()},[])

  return (
      <HeroSection/>
    );
}