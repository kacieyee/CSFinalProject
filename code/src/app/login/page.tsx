import './login.css';

export default function Login() {
    return (
      // <div className="flex flex-col items-center justify-center h-screen p-6 bg-gray-100">
      <div className="loginContainer">
        <div className="heading">
          Login Page
        </div>
  
        <div className="loginBox">
            <label className="label">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="inputField"
            />
  
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="inputField"
            />
  
          <button className="loginButton">
            Login
          </button>

            Don't have an account? <a href="/signup" style={{ color: '#ff3388' }}>Sign in</a> here.
        </div>
      </div>
    );
  }
  