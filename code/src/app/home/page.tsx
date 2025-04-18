import Link from "next/link";
import pinkLogo from "../../assets/pink logo.png";
import Image from "next/image";
import "./home.css";

export default function Home() {
  return (
    <div className="container">
              <Image 
                src={pinkLogo} 
                alt="Pink Logo" 
                className="logo"
              />
      <h1 className="heading">
        Reaching our budgeting goals together.<br />
        For the girlies, by the girlies.
      </h1>

      <div className="buttonContainer">
        <Link href="/login">
          <button className="pink-button">
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button className="pink-button">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}

