import { Roboto } from "next/font/google";
import Head from 'next/head';

import "./globals.css";
import TopHeader from "@/components/topHeader";
import PracticeNavbar from "@/components/practiceNavbar";
import RightDrawer from "@/components/rightDrawer";
import Footer from "@/components/footer";
import ScrollToTopButton from "@/components/ScrollButton";
import { keywords as keyword } from "@/utils/seo";
import { FirestoreProvider } from "@/lib/firestoreContext";
import HomeSectionHero from "@/components/homeSectionHero";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // jo weights chahiye wo list kar do
});

export const metadata = {
  title: {
    default: "Zaheer Welfare Organization:Welfare Trust",
    template: "%s - Zaheer Welfare Organization"
  },
  description: "come and Join Us @Zaheer Welfare Organization!",
  keywords: keyword,
  other:{
    'algolia-site-verification':'890917E7763E4A7D',
  }
  
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <Head>
      <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />

        <script type="application/ld+json" className="yoast-schema-graph">
          {
            `"@context": "https://schema.org",
            "@type": "NGO",
            "name": "Zaheer Welfare Organization",
            "alternateName": "Zaheer Welfare Trust",
            "url": "https://welfare-trust.vercel.app/",
            "logo": "https://welfare-trust.vercel.app/",
            "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+923223760042",
           "contactType": "customer service",
           "contactOption": "TollFree",
           "areaServed": "PK",
          "availableLanguage": "en"
  }`
          }
        </script>
      </Head>
      <body className={roboto.className}>
        <>
          <TopHeader />
           <HomeSectionHero/>
          <RightDrawer />
          <ScrollToTopButton />
          <FirestoreProvider>
          {children}
          </FirestoreProvider>
          <Footer />
        </>
      </body>
    </html>
  );
}