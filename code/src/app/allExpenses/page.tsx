'use client'
import styles from './allExpenses.module.css';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { getCookie } from 'cookies-next';
import { DeleteRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import EditExpensePopup from './EditExpensePopup'; 

interface Expense {
  _id: string;
  name: string;
  price: number;
  date: string;
  vendor: string;
  category: string;
}

interface Budget {
  _id: string;
  category: string;
  goal: number;
  interval: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // const [budget, setBudget] = useState<Budget[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/transactions", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await fetch("/api/budget", {method: "GET"});
      if (!res.ok) throw new Error("Failed to fetch budget");

      const data = await res.json();
      setBudget(data.expenses || []);
    } catch (error) {
      console.error("Error fetching budget:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBudget();
  }, []);

  const filterExpensesByDate = (expenses: Expense[]) => {
    const filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();

      return expenseDate >= start && expenseDate <= end;
    });

    return filtered;
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/transactions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({transactionId})
      });
  
      if (response.ok) {
        setExpenses(expenses.filter(expense => expense._id !== transactionId));
      } else {
        console.error("Failed to delete transaction:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const submitTransaction = async(e: any) => {
    try {
      e.preventDefault();

      const disallowedCategories = ["total expenses", "temp total"];

      if (disallowedCategories.includes(category.trim().toLowerCase())) {
          alert(`"${category}" is a reserved category and cannot be added.`);
          return;
      }

      const categoryExists = budget.some(budgetItem => budgetItem.category.toLowerCase() === category.toLowerCase());

      if (!categoryExists) {
        const newBudget = {
          category: category.toLowerCase(),
          goal: 0,
          interval: "monthly"
        };
  
        try {
          const response = await fetch("/api/budget", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newBudget),
          });
  
          if (!response.ok) {
            throw new Error("Failed to create new budget category.");
          }
        } catch (error) {
          console.error("Error creating new budget category:", error);
          alert("Failed to create new budget category.");
          return;
        }
      }
    
      try {
          const response = await fetch("/api/transactions", { 
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, price, date, vendor, category: category.toLowerCase()}),
          });
          
          if (response.ok) {
            setTransactionAdded(true);
          }
      } catch (error) {
          console.error("Error submitting transaction:", error);
      }      
    } catch (error) {
      alert("Fields cannot be blank!");
    }
  }

  const router = useRouter();
  const [isVisible, setVisible] = useState(false);
        const [name, setName] = useState('');
        const [price, setPrice] = useState('');
        const [date, setDate] = useState('');
        const [vendor, setVendor] = useState('');
  
      const openPopup = () => setVisible(true);
      const closePopup = () => setVisible(false);
      const [category, setCategory] = useState('');
      const [budget, setBudget] = useState<Budget[]>([]);
      const [transactionAdded, setTransactionAdded] = useState(false);
  const editTransaction = (expense: Expense) => {

    const submitTransaction = async(e: any) => {
      try {
        e.preventDefault();
  
        const disallowedCategories = ["total expenses", "temp total"];
  
        if (disallowedCategories.includes(category.trim().toLowerCase())) {
            alert(`"${category}" is a reserved category and cannot be added.`);
            return;
        }
  
        const categoryExists = budget.some(budgetItem => budgetItem.category.toLowerCase() === category.toLowerCase());
  
        if (!categoryExists) {
          const newBudget = {
            category: category.toLowerCase(),
            goal: 0,
            interval: "monthly"
          };
    
          try {
            const response = await fetch("/api/budget", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newBudget),
            });
    
            if (!response.ok) {
              throw new Error("Failed to create new budget category.");
            }
          } catch (error) {
            console.error("Error creating new budget category:", error);
            alert("Failed to create new budget category.");
            return;
          }
        }
      
        try {
            const response = await fetch("/api/transactions", { 
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({name, price, date, vendor, category: category.toLowerCase()}),
            });
            
            if (response.ok) {
              setTransactionAdded(true);
            }
        } catch (error) {
            console.error("Error submitting transaction:", error);
        }      
      } catch (error) {
        alert("Fields cannot be blank!");
      }
    }

    
    const query = new URLSearchParams({
      name: expense.name,
      price: expense.price.toString(),
      date: expense.date.slice(0, 10),
      vendor: expense.vendor,
      category: expense.category.toLowerCase(),
    }).toString();
  
    deleteTransaction(expense._id);
    router.push(`/expenses?${query}`);
  };

  return (
    <div className={`${styles.body} ${styles.row}`}>
      <div className={`${styles.column} ${styles.left}`}>
        <h2 className={styles.allExpH2}>All Expenses</h2>
        <label className={styles.dashboardLabel}>
          Start Date:
          <input
            className={styles.input}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className={styles.dashboardLabel}>
          End Date:
          <input
            className={styles.input}
            type="date"
            value={endDate}
            min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <div className={styles.popupContent}>
                        {/* <span className="closeButton" id="closePopup">&times;</span> */}
                        <form id="expenseForm" onSubmit={submitTransaction}>
                        <label className={styles.formLabel}>Expense Name:</label>
                            <input className={styles.expensesInput} type="text" value={name} onChange={(e) => setName(e.target.value)} id="name" name="name" required></input><br></br>

                            <label className={styles.formLabel}>Price:</label>
                            <input className={styles.expensesInput} type="number" value={price} onChange={(e) => setPrice(e.target.value)} id="price" name="price" required></input><br></br>

                            <label className={styles.formLabel}>Date:</label>
                            <input className={styles.expensesInput} type="date" value={date} onChange={(e) => setDate(e.target.value)} id="date" name="date" required></input><br></br>

                            <label className={styles.formLabel}>Vendor:</label>
                            <input className={styles.expensesInput} type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} id="vendor" name="vendor" required></input><br></br>

                        <div className={styles["button-row"]}>
                        <label className={styles.formLabel}>Category:</label> 
                        <input 
                            className={styles.expensesInput}
                            list="categories" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value.toLowerCase())} 
                        />
                        <datalist id="categories">
                            {budget.length > 0 ? (
                            budget.filter((categoryOption) => 
                                !["total expenses", "temp total"].includes(categoryOption.category.toLowerCase())
                            ).map((categoryOption) => (
                                <option key={categoryOption._id} value={categoryOption.category} />
                            ))
                            ) : (
                            <option>No categories available</option>
                            )}
                        </datalist>
                        <button className={styles.button} type="submit">Add new expense!</button>

                        </div>
                    </form>
                    </div>
        
        {/* <EditExpensePopup /> */}
      </div>
      <div className={`${styles.column} ${styles.right}`}>
        <ul className={styles.ul}>
          {filterExpensesByDate(expenses).length === 0 ? (
            <li className={styles.li}>No expenses in this date range.</li>
            ) : (
              [...filterExpensesByDate(expenses)]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
              <li key={expense._id} className={`${styles["expense-item"]} ${styles.li}`}>
                <div className={`${styles["expense-info"]} ${styles.nestedDiv}`}>
                  <div className={`${styles.date} ${styles.nestedDiv}`}><strong className={styles.strong}></strong> {new Date(expense.date).toLocaleDateString('en-US', {weekday: "long", day: "numeric", month: "long", year: "numeric"})}</div>
                  <div className={`${styles.expenseprice} ${styles.nestedDiv}`}>${expense.price.toFixed(2)} on {expense.name} at {expense.vendor}.</div>
                </div>
                  <button className={styles.editButton} onClick={() => editTransaction(expense)}>
                    [Edit]
                  </button>
                  
                  <div className={`${styles["expense-right"]} ${styles.nestedDiv}`}>
                    <div className={`${styles["expense-category"]} ${styles.nestedDiv}`}>{expense.category}</div>
                    <button className={styles.deleteButton} onClick={() => deleteTransaction(expense._id)}>x
                    </button>
                    {/* <button className="deleteButton" onClick={() => deleteTransaction(expense._id)}>x
              <DeleteRounded sx={{ color: '#FF9BD1' }}/>
            </button> */}
                  </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
