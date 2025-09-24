"use client";

import { useEffect, useState } from "react";

export default function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth < breakpoint); // md breakpoint
        };
        checkScreen(); // run on mount
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, [breakpoint]);

    return isMobile
}