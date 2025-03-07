import Link from "next/link";

export default function Home() {
  return (
    // <div className="flex flex-col items-center justify-center h-screen p-6">
    <div className="container">
      <h1 className="heading">
        Reaching our budgeting goals together.<br />
        For the girlies, by the girlies.
      </h1>

      <div className="buttonContainer">
        <Link href="/login">
          <button className="button">
            Login
          </button>
        </Link>
        <Link href="/signup">
          {/* <button className="bg-pink-300 text-white py-2 px-6 rounded-lg hover:bg-pink-500"> */}
          <button className="button">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}

