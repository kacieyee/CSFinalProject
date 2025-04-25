'use client'
import "./profile.css";
import { useEffect, useState } from "react";
import { DeleteRounded, VisibilityRounded, VisibilityOffRounded } from '@mui/icons-material';

interface Budget {
  _id: string,
  category: string,
  goal: number,
  interval: string
};

interface UserData {
  username: string;
  password: string;
  budgets: Budget[];
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [category, setCategory] = useState('');
  const [tempGoals, setTempGoals] = useState<{[key: string]: string}>({});
  const [budget, setBudget] = useState<Budget[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewGoalPopup, setShowNewGoalPopup] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingUserInfo, setIsEditingUserInfo] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch("/api/users", {
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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>

    );
  }

  const submitBudget = async (e: any) => {
    e.preventDefault();

    if (!category.trim()) {
      alert("Category cannot be blank!");
      return;
    }

    const disallowedCategories = ["total expenses", "temp total"];

    if (disallowedCategories.includes(category.trim().toLowerCase())) {
      alert(`"${category}" is a reserved category and cannot be added.`);
      return;
    }

    const categoryExists = userData?.budgets.some(budget => budget.category.toLowerCase() === category.toLowerCase());

    if (categoryExists) {
      alert("This budget category already exists!");
      return;
    }

    try {
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          goal: 0,
          interval: "monthly"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add budget");
      }

      const updatedUserResponse = await fetch("/api/users", {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, newGoal, newInterval }),
      });

      if (!response.ok) {
        throw new Error("Failed to update budget");
      }

      const updatedUserResponse = await fetch("/api/users", {
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
      const transactionResponse = await fetch("/api/transactions", {
        method: "GET",
        credentials: "include",
      });

      if (!transactionResponse.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const transactionData = await transactionResponse.json();
      const hasTransactions = transactionData.expenses.some(txn => txn.category === category);

      if (hasTransactions) {
        alert(`Cannot delete the "${category}" category because transactions exist under it.`);
        return;
      }

      const response = await fetch("/api/budget", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
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
    setTempGoals((prevGoals) => ({
      ...prevGoals,
      [category]: value,
    }));
  };

  const handleIntervalChange = (budget: Budget, newInterval: string) => {
    updateBudget(budget.category, budget.goal, newInterval);
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
          <p><strong>Name:</strong></p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ marginRight: "1rem", flex: 1 }}>
              <strong>Password:</strong>{" "}
            </p>
              <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                {showPassword ? (
                  <VisibilityRounded sx={{ color: '#FF9BD1' }} />
                ) : (
                  <VisibilityOffRounded sx={{ color: '#FF9BD1' }} />
                )}
              </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="button"
          style={{ marginTop: "1rem", marginBottom: "1rem" }}
        >
          {isEditingProfile ? "Finish Editing" : "Edit Goals"}
        </button>
      </div>

      <div className="column-right">
        <h1>Budgeting Goals</h1>
        <div className="profileSection">
        {userData.budgets.filter(b => !["temp total"].includes(b.category.toLowerCase())).length > 0 ? (
          userData.budgets
            .filter(b => !["temp total"].includes(b.category.toLowerCase()))
            .map((budget, index) => (
              <div key={index} className={!isEditingProfile ? "goals" : ""}>
                <div>
                  {isEditingProfile ? (
                    <>
                      <label>You have a </label>
                      <select 
                        value={budget.interval} 
                        onChange={(e) => handleIntervalChange(budget, e.target.value)}
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
                    </>
                  ) : (
                    <p>
                      <span className="budget-label">You have a </span>
                      <span className="budget-variable">{budget.interval}</span>
                      <span className="budget-label"> budget of $</span>
                      <span className="budget-variable">{budget.goal}</span>
                      <span className="budget-label"> for </span>
                      <span className="budget-variable">{budget.category}</span>.
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No budgeting goals set.</p>
          )}
          
          <h1>Add a new goal!</h1>
          <form onSubmit={submitBudget} className="new-goal-form">
            <div className="budgetGoal">
              For what category?
              <input
                list="categories"
                value={category}
                onChange={(e) => setCategory(e.target.value.toLowerCase())}
              />
              <datalist id="categories">
                {budget.length > 0 ? (
                  budget.map((categoryOption) => (
                    <option key={categoryOption._id} value={categoryOption.category} />
                  ))
                ) : (
                  <option>No categories available</option>
                )}
              </datalist>
            </div>
            <br />
            <button type="submit" className="button">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}
