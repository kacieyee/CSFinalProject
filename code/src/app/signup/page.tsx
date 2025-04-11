'use client'
import './signup.css';
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const router = useRouter();

    const submitUser = async (e: any) => {
      try {
        e.preventDefault();
    
        if (password !== confirm) {
          alert("Passwords must match.");
          return;
        }
    
        const response = await fetch("/api/users", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          router.push('/login');
        } else {
          alert(data.message || "Error signing up. Please try again.");
        }
      } catch (err) {
        alert("Something went wrong. Please try again.");
      }
    };    

    return (
      <div className="loginContainer">
        <div className="heading">Sign Up</div>
        
        <form onSubmit={submitUser}>
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

          <div className="mb-6">
            <label className="label">Confirm Password</label>
            <input
              type="password"
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Renter your password"
              className="inputField"
            />
          </div>
          <div className="flex justify-center items-center">
          <button type="submit" className="loginButton">
            Sign Up
          </button>
          </div>
        </div>
        </form>

      </div>
    );
  }
  