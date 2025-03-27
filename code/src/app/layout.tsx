"use client";
import Link from "next/link";
import "./globals.css";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import pinkLogo from "../assets/pink logo.png"; 
import whiteLogo from "../assets/white logo.png";

// validate json web token to ensure user is properly authenticated
function isTokenValid() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const expiration = decodedToken.exp ?? 0;
    return expiration * 1000 > Date.now(); // check if token has expired
  } catch (error) {
    return false;
  }
}

//include navbar in the rootlayout so it's on all the pages
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleProtectedRoute = (event: React.MouseEvent, href: string) => {
    event.preventDefault();

    if (!isTokenValid()) {
      router.push("/login");
    } else {
      router.push(href);
    }
  }
  
  return (
    <html lang="en">
      <body className="bg-black">
        <div className="flex flex-col h-screen">
          {/* navbar */}
          <nav className="navbar">

          <Link href="/">
              <Image 
                src={whiteLogo} 
                alt="Pink Logo" 
                width={80}
                height={80} 
                className="mr-4"
              />
            </Link>

            <div className="max-w-4xl mx-auto flex justify-center gap-8 text-lg">
              
              <Link href="/home" className="hover:text-gray-300">Home</Link>
              
              <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              
              <Link href="/expenses" className="hover:text-gray-300">Expenses</Link>
              
              <Link href="/profile" className="hover:text-gray-300">Profile</Link>
              
              <Link href="/login" className="hover:text-gray-300">Login</Link>
            </div>
          </nav>

          {/* content */}
          <main className="flex-1 flex flex-col items-center justify-center p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
