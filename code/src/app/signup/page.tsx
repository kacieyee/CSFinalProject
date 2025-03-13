'use client'
import { useState } from "react";
import { postUser } from "../api/users/route"
import { redirect } from 'next/navigation'

export default function SignUp() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')

    const submitUser = async(e: any) => {
      e.preventDefault()

      if (password === confirm) {
        postUser(username, password);
        redirect('/login')
      } else {
        alert("Passwords must be matching.")
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <h1 className="text-4xl font-bold p-6">Sign Up Page</h1>
        
        <form onSubmit={submitUser}>
        <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
  
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
  
          <button type="submit" className="w-full bg-pink-400 text-white py-3 rounded-lg hover:bg-pink-500 transition">
            Sign Up
          </button>
        </div>
        </form>

      </div>
    );
  }
  