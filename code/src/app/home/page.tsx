"use client";
import Link from "next/link";
import pinkLogo from "../../assets/pink logo.png";
import Image from "next/image";
import "./home.css";
import * as turf from "@turf/turf";
import { useEffect, useState } from "react";

export default function Home() {
  const [linePoints, setLinePoints] = useState("");

  useEffect(() => {
    const points = [
      [0, 60],
      [200, 50],
      [400, 70],
      [600, 40],
      [800, 60],
      [1000, 55],
    ];

    const lineString = turf.lineString(points);
    const curve = turf.bezierSpline(lineString, { resolution: 1000 });
    const coordinates = curve.geometry.coordinates;
    const svgPoints = coordinates.map(coord => coord.join(",")).join(" ");
    setLinePoints(svgPoints);
  }, []);

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

      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "80px",
          zIndex: -1,
        }}
      >
        <polyline
          points={linePoints}
          fill="none"
          stroke="#FF9BD1"
          strokeWidth="8"
        />
      </svg>
    </div>
  );
}

