"use client";
import Link from "next/link";
import pinkLogo from "../../assets/pink logo.png";
import Image from "next/image";
import styles from "./home.module.css"
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
        className={styles.logo} 
      />
      <h1 className="heading">
        Reaching our budgeting goals together.<br />
        For the girlies, by the girlies.
      </h1>

      <div className="buttonContainer">
        <Link href="/login">
          <button className={styles["pink-button"]}>
            Login
            </button>
        </Link>
        <Link href="/signup">
          <button className={styles["pink-button"]}>
            Sign Up
            </button>
        </Link>
      </div>
      <svg
        viewBox="0 0 1440 200"
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
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9BD1" />
            <stop offset="100%" stopColor="#FF4C8A" />
          </linearGradient>
        </defs>
        <path
          d="M0,40 C300,-30 600,130 900,40 C1200,20 1440,90 1440,90"
          stroke="url(#gradient1)"
          strokeWidth="15"
        />
        <path
          d="M0,160 C280,100 700,200 1100,150 C1300,130 1440,170 1440,170"
          stroke="url(#gradient1)"
          strokeWidth="15"
        />
      </svg>

    </div>
  );
}

