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
  const [showNewGoalPopup, setShowNewGoalPopup] = useState(false);

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

  // Function to toggle the visibility of the popup
  const toggleNewGoalPopup = () => {
    setShowNewGoalPopup(!showNewGoalPopup);
  };

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
                <div className="budgetGoal">
                    Spend up to
                    {/* <span className="currencySymbol">  $</span> */}
                    <input type="number" className="amount" value = {budget.goal}/>
                    dollars every 
                    <select className="category" value = {budget.interval}>
                      <option>day</option>
                      <option>week</option>
                      <option>2 weeks</option>
                      <option>month</option>
                      <option>year</option>
                    </select>
                    on 
                    <select className="category" value = {budget.category}>
                      <option>groceries</option>
                      <option>savings</option>
                      <option>rent</option>
                      <option>total expenses</option>
                    </select>
                    {/* <button className= "x">x</button> */}
                  
                </div>  
                {/* <p>You have a(n) {budget.interval} budget of ${budget.goal}</p> */}
              </div>
            ))
          ) : (
            <p>No budgeting goals set.</p>
          )}
          

          {showNewGoalPopup && (
            <div className="newGoalPopup">
              <h2>Add new goal</h2>
              <div className="newBudgetGoal">
                Spend up to
                <input type="number" className="amount" />
                dollars every
                <select className="category">
                  <option>day</option>
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
              <button className="button">Submit</button>
              <button className="button" onClick={toggleNewGoalPopup}>Cancel</button>
            </div>
          )}

          {!showNewGoalPopup && (
            <div className="addGoalButtonContainer">
              <button className="addExpense button" onClick={toggleNewGoalPopup}>
                +
              </button>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}