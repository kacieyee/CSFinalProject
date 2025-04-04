'use client'
import "./profile.css";
import { useEffect, useState } from "react";
import { DeleteRounded, VisibilityRounded, VisibilityOffRounded } from '@mui/icons-material';

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
  const [category, setCategory] = useState('');
  const [tempGoals, setTempGoals] = useState<{ [key: string]: string }>({});

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

  const submitBudget = async (e: any) => {
    e.preventDefault();

    if (!category.trim()) {
        alert("Category cannot be blank!");
        return;
    }

    try {
        const response = await fetch("/api/budget", { 
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                category,
                goal: 0,
                interval: "monthly"
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to add budget");
        }

        const updatedUserResponse = await fetch("/api/profile", {
            method: "GET",
            credentials: "include"
        });

        if (updatedUserResponse.ok) {
            const updatedUserData = await updatedUserResponse.json();
            setUserData(updatedUserData);
        }

        setCategory('');

    } catch (err) {
        console.error("Error submitting budget:", err);
        alert("An error occurred while adding the budget.");
    }
};

const updateBudget = async (category: string, newGoal: number, newInterval: string) => {
  try {
      const response = await fetch("/api/budget", {
          method: "PATCH",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({category, newGoal, newInterval}),
      });

      if (!response.ok) {
          throw new Error("Failed to update budget");
      }

      const updatedUserResponse = await fetch("/api/profile", {
          method: "GET",
          credentials: "include"
      });

      if (updatedUserResponse.ok) {
          const updatedUserData = await updatedUserResponse.json();
          setUserData(updatedUserData);
      }

  } catch (err) {
      console.error("Error updating budget:", err);
      alert("An error occurred while updating the budget.");
  }
};

const deleteBudget = async (category: string) => {
  try {
    const response = await fetch("/api/budget", {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({category}),
    });

    if (response.ok) {
      setUserData((prevData) => 
        prevData 
          ? { ...prevData, budgets: prevData.budgets.filter(budget => budget.category !== category) }
          : null
      );
    }
  } catch (err) {
    console.error("Error deleting budget:", err);
  }
};

const handleGoalChange = (category: string, value: string) => {
  if (value === '') {
    setTempGoals((prevGoals) => ({
      ...prevGoals,
      [category]: value,
    }));
  } else {
    setTempGoals((prevGoals) => ({
      ...prevGoals,
      [category]: value,
    }));
  }
};

const handleGoalSubmit = (e: React.KeyboardEvent<HTMLInputElement>, budget: Budget) => {
  if (e.key === "Enter") {
    updateBudget(budget.category, Number(tempGoals[budget.category] || budget.goal), budget.interval);
    e.currentTarget.blur();
  }
};

  return (
    <div className="row">
      <div className="column-left">
        <h1>Profile</h1>
        <div className="profileSection">
          <p><strong>Name:</strong> {userData.username}</p>
          <div style={{ display: "flex", alignSelf: "center" }}>
            <p style={{ marginRight: "20rem" }}>
            <strong>Password:</strong> {"•".repeat(userData.password.length)}
            </p>
            <VisibilityRounded sx={{ color: '#FF9BD1' }} />
          </div>
        </div>
      </div>
      <div className="column-right">
        <h1>Budgeting Goals</h1>
        <div className="profileSection">
          {userData.budgets.length > 1 ? (
            userData.budgets.slice(1).map((budget, index) => (
              <div key={index}>
                <div>
                  <label>You have a </label>
                  <select 
                    value={budget.interval} 
                    onChange={(e) => updateBudget(budget.category, budget.goal, e.target.value)}
                  >
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                    <option value="biweekly">biweekly</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                  </select>

                  <label> budget of $ </label>
                  <input 
                    type="number"
                    value={tempGoals[budget.category] || budget.goal}
                    onChange={(e) => handleGoalChange(budget.category, e.target.value)} 
                    onKeyDown={(e) => handleGoalSubmit(e, budget)}
                    className="goal-input"
                  />
                  <label> for {budget.category}.</label>
                  {budget.category.toLowerCase() !== "total expenses" && (
                    <button 
                      onClick={() => deleteBudget(budget.category)} 
                      className="delete-button"
                    ><DeleteRounded sx={{ color: '#FF9BD1' }}/>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No budgeting goals set.</p>
          )}

          <h1> Add a new goal!</h1>
          <form onSubmit={submitBudget}>
          <div className="budgetGoal">
            For what category? 
            <input
              type="text"
              onChange={(e) => setCategory(e.target.value)}
              className="category"
            />
            {/* every 
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
            </select> */}
          </div>  
          <br></br>
          <button type="submit" className="button">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}