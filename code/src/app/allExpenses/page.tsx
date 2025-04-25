'use client'
import './allExpenses.css';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { getCookie } from 'cookies-next';
import { DeleteRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

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
  const [budget, setBudget] = useState<Budget[]>([]);
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

  const router = useRouter();
  const editTransaction = (expense: Expense) => {
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
    <div className="row">
      <div className="column left">
        <h2>All Expenses</h2>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>
      <div className="column right">
        <ul>
          {filterExpensesByDate(expenses).length === 0 ? (
            <li>No expenses in this date range.</li>
            ) : (
              [...filterExpensesByDate(expenses)]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
              <li key={expense._id} className="expense-item">
                <div className="expense-info">
                  <div className="date"><strong></strong> {new Date(expense.date).toLocaleDateString('en-US', {weekday: "long", day: "numeric", month: "long", year: "numeric"})}</div>
                  <div className="expenseprice">${expense.price.toFixed(2)} at {expense.vendor}.</div>
                </div>
                  <button className="editButton" onClick={() => editTransaction(expense)}>
                    [Edit]
                  </button>
                  
                  <div className="expense-right">
                    <div className="expense-category">{expense.category}</div>
                    <button className="deleteButton" onClick={() => deleteTransaction(expense._id)}>x
                    </button>
                  </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
