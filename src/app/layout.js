import { Inter, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ১. ফন্ট কনফিগারেশন (একবার করে ডিক্লেয়ার করা হয়েছে)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// ২. মেটাডাটা সেকশন
export const metadata = {
  title: "CodeArena - Master Competitive Programming",
  description: "The ultimate playground for competitive programmers. Solve curated problems, join high-stakes contests, and build your technical legacy.",
};

// ৩. মেইন লেআউট ফাংশন
export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${bricolage.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning // এক্সটেনশন জনিত এরর বন্ধ করতে
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        />
      </head>
      <body 
        className="antialiased bg-background text-text-main font-sans"
        suppressHydrationWarning // হাইড্রেশন এরর বন্ধ করতে
      >
        {children}
      </body>
    </html>
  );
}