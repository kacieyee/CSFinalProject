'use client'
import './login.css';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { VisibilityRounded, VisibilityOffRounded } from '@mui/icons-material';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const checkUser = async(e: any) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      const checkResult = data.result;

      if (checkResult === 0) {
        router.push('/dashboard');
        router.refresh();
      } else if (checkResult === 1) {
        alert("Incorrect password. Please try again.");
      } else if (checkResult === 2) {
        alert("User does not exist.");
      } else {
        console.log("Server error");
      }
    } catch (err) {
      alert("Fields cannot be blank!");
    }
  };

  return (
    <div className="loginContainer">
      <div className="heading">Login</div>

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

          <div className="flex justify-center items-center">
            <button type="submit" className="loginButton">
              Login
            </button>
          </div>

          <div className="subtext">
            Don't have an account?&nbsp;
            <a href="/signup" style={{ color: '#ff3388' }}>&nbsp;Sign up&nbsp;</a> here.
          </div>
        </div>
      </form>
    </div>
  );
}
