'use client'
import './expenses.css';
import React, { useState, ChangeEvent, KeyboardEvent } from 'react';


interface Expense {
  name: string;
  price: number;
  date: string;  // Storing the date as a string (e.g., '2025-03-12')
  vendor: string;
  category: string;
}
export default function Expenses() {
  // Sample data for expenses
  const [expenses] = useState<Expense[]>([
    {
      name: 'Groceries',
      price: 50.75,
      date: '2025-03-10',
      vendor: 'SuperMart',
      category: 'Groceries'
    },
    {
      name: 'Flight Ticket',
      price: 350.0,
      date: '2025-03-05',
      vendor: 'AirlineX',
      category: 'Travel'
    },
    {
      name: 'Rent',
      price: 1200.0,
      date: '2025-03-01',
      vendor: 'Apartment Complex',
      category: 'Rent'
    }
  ]);
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
                <div><strong>Date:</strong> {expense.date}</div>
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
            <form id="expenseForm">
            <label>Expense Name:</label>
                <input type="text" id="name" name="name" required></input><br></br>

                <label>Price:</label>
                <input type="number" id="price" name="price" required></input><br></br>

                <label>Date:</label>
                <input type="date" id="date" name="date" required></input><br></br>

                <label>Vendor:</label>
                <input type="text" id="vendor" name="vendor" required></input><br></br>

                <label>Category:</label>
                <input type="text" id="category" name="category" required></input><br></br>
            </form>
            
            <button className="button" type="button">Add new expense!</button>
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
  