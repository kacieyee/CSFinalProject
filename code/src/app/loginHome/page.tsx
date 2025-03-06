import Link from "next/link";

export default function LoginHome() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <h1 className="text-4xl font-bold text-center">
        Reaching our budgeting goals together.<br />
        For the girlies, by the girlies.
      </h1>

      <div className="mt-6 flex gap-4">
        <Link href="/login">
          <button className="bg-pink-300 text-white py-2 px-6 rounded-lg hover:bg-pink-500">
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button className="bg-pink-300 text-white py-2 px-6 rounded-lg hover:bg-pink-500">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
