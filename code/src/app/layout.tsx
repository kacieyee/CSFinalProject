import Link from "next/link";
import "./globals.css";

//include navbar in the rootlayout so it's on all the pages
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <div className="flex flex-col h-screen">
          {/* navbar */}
          <nav className="bg-pink-300 text-white p-6 shadow-md">
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
