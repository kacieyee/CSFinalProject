'use client'
import './expenses.css';
import React, { useEffect, useState } from 'react';

interface Expense {
  name: string;
  price: number;
  date: string;
  vendor: string;
  category: string;
};

export default function Expenses() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');

  const submitTransaction = async(e: any) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to add an expense.");
        return;
    }

    try {
        await fetch("/api/transactions", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, name, price, date, vendor, category }),
        });
    } catch (error) {
        console.error("Error submitting transaction:", error);
        alert("An error occurred.");
    }
  }

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to view transactions.");
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "GET",
        headers: {Authorization: `Bearer ${token}`},
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    
    <div className="row">
      <div className="column left">
        <h2>Recent Expenses</h2>
        <ul>
          {expenses.length === 0 ? (
            <li>No recent expenses</li>
          ) : (
            expenses.map((expense, index) => (
              <li key={index}>
                <div><strong>Name:</strong> {expense.name}</div>
                <div><strong>Price:</strong> ${expense.price.toFixed(2)}</div>
                <div><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</div>
                <div><strong>Vendor:</strong> {expense.vendor}</div>
                <div><strong>Category:</strong> {expense.category}</div>
              </li>
            ))
          )}
        </ul>
        
      </div>
      <div className="column right">
        <h2>Upload Receipt</h2>
        <div className="upload-section">
          {/* back end make a receipt.php later! */}
            <form action="/receipt.php">
              <label className="label">Select a file:</label>
              <input type="file" id="input"></input>
              <br></br>
              <input className="button" type="submit"></input>
            </form>
        </div>

        <br></br>
        <div id ="expensePopup" className="popup">
        <h2>Add new Expense</h2>
          <div className="popupContent">
            {/* <span className="closeButton" id="closePopup">&times;</span> */}
            <form id="expenseForm" onSubmit={submitTransaction}>
            <label>Expense Name:</label>
                <input type="text" onChange={(e) => setName(e.target.value)} id="name" name="name" required></input><br></br>

                <label>Price:</label>
                <input type="number" onChange={(e) => setPrice(e.target.value)} id="price" name="price" required></input><br></br>

                <label>Date:</label>
                <input type="date" onChange={(e) => setDate(e.target.value)} id="date" name="date" required></input><br></br>

                <label>Vendor:</label>
                <input type="text" onChange={(e) => setVendor(e.target.value)} id="vendor" name="vendor" required></input><br></br>

                <label>Category:</label>
                <input type="text" onChange={(e) => setCategory(e.target.value)} id="category" name="category" required></input><br></br>
            <button className="button" type="submit">Add new expense!</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// export default function Expenses() {
//     return (
//       // <div className="flex flex-col h-screen p-6">
//       //   <h1 className="text-4xl font-bold">Expenses</h1>
//       //   <p className="mt-4 text-lg">Welcome to the expenses page!</p>
//       // </div>
//       <div className="container">
//       <div className="left">
//         <h2>Recent Expenses</h2>
//         <ul>
//           {expenses.length === 0 ? (
//             <li>No recent expenses</li>
//           ) : (
//             expenses.map((expense, index) => (
//               <li key={index}>
//                 <div><strong>Name:</strong> {expense.name}</div>
//                 <div><strong>Price:</strong> ${expense.price.toFixed(2)}</div>
//                 <div><strong>Date:</strong> {expense.date}</div>
//                 <div><strong>Vendor:</strong> {expense.vendor}</div>
//                 <div><strong>Category:</strong> {expense.category}</div>
//               </li>
//             ))
//           )}
//         </ul>
//       </div>
//       <div className="right">
//         <h2>Upload Receipt</h2>
//         {/* Placeholder for the receipt upload section */}
//         <div className="upload-section">
//           <p>No receipt uploaded</p>
//         </div>
//       </div>
//     </div>
//     );
//   }