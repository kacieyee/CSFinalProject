'use client'
import './login.css';
import { useState } from "react";
import { userLogin } from "../api/users/route"
import { redirect } from 'next/navigation'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const checkUser = async(e: any) => {
      e.preventDefault()

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      const checkResult = data.result;

        if (checkResult === 0) {
          const token = data.token;
          localStorage.setItem("authToken", token);
          console.log("Logged in");
          //redirect('/dashboard')
<<<<<<< HEAD
=======
          alert("Logged in!")
>>>>>>> df01f4e296cd6f93f93fcc9eda962fb61d570c64
        } else if (checkResult === 1) {
          alert("Incorrect password. Please try again.")
        } else if (checkResult === 2) {
          alert("User does not exist.")
        } else {
          console.log("Server error")
        }
      } catch(err) {
        console.log(err)
      }
    }

    return (
      // <div className="flex flex-col items-center justify-center h-screen p-6 bg-gray-100">
      <div className="loginContainer">
        <div className="heading">
          Login Page
        </div>

        <form onSubmit={checkUser}>
        <div className="loginBox">
            <label className="label">Username</label>
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="inputField"
            />
  
            <label className="label">Password</label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="inputField"
            />
  
          <button type="submit" className="loginButton">
            Login
          </button>

            Don't have an account? <a href="/signup" style={{ color: '#ff3388' }}>Sign up</a> here.
        </div>
        </form>
      </div>
    );
  }
  