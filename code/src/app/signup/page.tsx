export default function SignUp() {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <h1 className="text-4xl font-bold p-6">Sign Up Page</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
  
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
  
          <button className="w-full bg-pink-400 text-white py-3 rounded-lg hover:bg-pink-500 transition">
            Login
          </button>
        </div>

      </div>
    );
  }
  