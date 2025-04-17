'use client'
import './allExpenses.css';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { getCookie } from 'cookies-next';
import { DeleteRounded } from '@mui/icons-material';

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
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionAdded, setTransactionAdded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'GET',
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');

      const data = await res.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await fetch('/api/budget', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to fetch budget');

      const data = await res.json();
      setBudget(data.budgets || []);
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBudget();
    if (transactionAdded) {
      setTransactionAdded(false);
      setName('');
      setPrice('');
      setDate('');
      setVendor('');
      setCategory('');
    }
  }, [transactionAdded]);

  const filterExpensesByDate = (expenses: Expense[]) => {
    const filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const start = startDate ? new Date(startDate) : new Date(0); 
      const end = endDate ? new Date(endDate) : new Date(); 

      return expenseDate >= start && expenseDate <= end;
    });

    return filtered;
  };

  const submitTransaction = async (e: any) => {
    try {
      e.preventDefault();

      const categoryExists = budget.some(
        (budgetItem) => budgetItem.category === category
      );

      if (!categoryExists) {
        const newBudget = {
          category,
          goal: 0,
          interval: 'monthly',
        };

        try {
          const response = await fetch('/api/budget', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBudget),
          });

          if (!response.ok) {
            throw new Error('Failed to create new budget category.');
          }
        } catch (error) {
          console.error('Error creating new budget category:', error);
          alert('Failed to create new budget category.');
          return;
        }
      }

      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, price, date, vendor, category }),
        });

        if (response.ok) {
          setTransactionAdded(true);
        }
      } catch (error) {
        console.error('Error submitting transaction:', error);
      }
    } catch (err) {
      alert('Fields cannot be blank!');
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/transactions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      if (response.ok) {
        setExpenses(expenses.filter((expense) => expense._id !== transactionId));
      } else {
        console.error('Failed to delete transaction:', await response.json());
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const uploadResponse = await fetch('/api/sendDocument', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        const requestId = uploadResult.requestId;

        if (requestId) {
          let status = 'notStarted';
          let results: any = null;
          let attempts = 0;
          const maxAttempts = 20;
          const interval = 1000;

          while (status !== 'succeeded' && attempts < maxAttempts) {
            try {
              const resultsResponse = await fetch(
                `/api/getResults?id=${requestId}`
              );

              if (resultsResponse.ok) {
                const data: any = await resultsResponse.json();
                status = data.status;
                results = data;

                if (status === 'succeeded') {
                  console.log('Results:', results);
                  const merchantName =
                    results.analyzeResult.documents[0].fields.MerchantName
                      .valueString;
                  const total =
                    results.analyzeResult.documents[0].fields.Total.valueCurrency
                      .amount;
                  const transactionDate =
                    results.analyzeResult.documents[0].fields.TransactionDate
                      .valueDate;
                  const receiptType =
                    results.analyzeResult.documents[0].fields.ReceiptType
                      .valueString;

                  setVendor(merchantName);
                  setPrice(total.toString());
                  setDate(transactionDate);
                  setCategory(receiptType);

                  break;
                }
              } else {
                console.error('Failed to fetch results:', await resultsResponse.json());
              }
            } catch (resultsError) {
              console.error('Error fetching results:', resultsError);
            }

            attempts++;
            await new Promise((resolve) => setTimeout(resolve, interval));
          }

          if (status !== 'succeeded') {
            alert('Processing timed out or failed.');
          }
        } else {
          console.error('apim-request-id not found in upload response body.');
          alert('Request ID not found.');
        }
      } else {
        const errorData = await uploadResponse.json();
        console.error('Failed to upload receipt:', errorData);
        alert('Failed to upload receipt.');
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Error uploading receipt.');
    } finally {
      setIsLoading(false);
    }
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
            filterExpensesByDate(expenses).map((expense) => (
              <li key={expense._id} className="expense-item">
                <div className="expense-info">
                  <div><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</div>
                  <div><strong>Name:</strong> {expense.name}</div>
                  <div><strong>Price:</strong> ${expense.price.toFixed(2)}</div>
                  <div><strong>Vendor:</strong> {expense.vendor}</div>
                  <div><strong>Category:</strong> {expense.category}</div>
                  </div>
                  <button
                    className="deleteButton"
                    onClick={() => deleteTransaction(expense._id)}
                  >
                    <DeleteRounded sx={{ color: '#FF9BD1' }} />
                  </button>
              </li>
            ))
          )}
        </ul>

      </div>
    </div>
  );
}
