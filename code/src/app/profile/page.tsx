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
          {userData.budgets.length > 1 ? (
            userData.budgets.slice(1).map((budget, index) => (
              <div key={index}>
                <h2>{budget.category}</h2>
                <p>You have a(n) {budget.interval} budget of ${budget.goal}</p>
              </div>
            ))
          ) : (
            <p>No budgeting goals set.</p>
          )}

          <h1> Add new goal</h1>
          <div className="budgetGoal">
            Spend up to
            <input type="number" className="amount"/>
            every 
            <select className="category">
              <option>week</option>
              <option>2 weeks</option>
              <option>month</option>
              <option>year</option>
            </select>
            on 
            <select className="category">
              <option>groceries</option>
              <option>savings</option>
              <option>rent</option>
              <option>total expenses</option>
            </select>
            
          </div>  
          <br></br>
          <button className="button">Submit</button>
        </div>

        
      </div>
    </div>
  );
}