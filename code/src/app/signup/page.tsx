'use client'
import './signup.css';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { VisibilityRounded, VisibilityOffRounded } from '@mui/icons-material';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        <h1>Sign Up</h1>
        
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
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="inputField"
              style={{ paddingRight: '2.5rem' }}
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                paddingBottom: '15px',
              }}
            >
              {showPassword ? (
                <VisibilityRounded sx={{ color: 'white' }} />
              ) : (
                <VisibilityOffRounded sx={{ color: 'white' }} />
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="label">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="inputField"
              style={{ paddingRight: '2.5rem' }}
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                paddingBottom: '15px',
              }}
            >
              {showPassword ? (
                <VisibilityRounded sx={{ color: 'white' }} />
              ) : (
                <VisibilityOffRounded sx={{ color: 'white' }} />
              )}
            </div>
          </div>
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
  