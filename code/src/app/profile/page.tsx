'use client'
import "./profile.css";
import { useEffect, useState } from "react";

interface Budget {
  category: string;
  goal: number;
  interval: string;
}

interface UserData {
  username: string;
  password: string;
  budgets: Budget[];
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <p>Error loading profile...</p>;
  }

  return (
    <div className="row">
      <div className="column left">
        <h1>Profile</h1>
        <div className="profileSection">
          <p><strong>Name:</strong> {userData.username}</p>
          <p><strong>Password:</strong> {userData.password}</p>
        </div>
      </div>
      <div className="column right">
        <h1>Budgeting Goals</h1>
        <div className="profileSection">
          {userData.budgets.length > 2 ? (
            userData.budgets.slice(2).map((budget, index) => (
              <div key={index}>
                <h2>{budget.category}</h2>
                <p>You have a(n) {budget.interval} budget of ${budget.goal}</p>
              </div>
            ))
          ) : (
            <p>No budgeting goals set.</p>
          )}
        </div>
      </div>
    </div>
  );
}