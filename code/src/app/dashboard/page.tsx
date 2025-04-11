'use client';
import React, { useEffect, useState } from 'react';``
import './dashboard.css';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, ArcElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { color } from 'chart.js/helpers';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, annotationPlugin, ArcElement);


export const data = {
  labels: ['Savings', 'Groceries', 'Housing', 'Health', 'Transport', 'For funsies'],
  datasets: [
    {
      label: 'Amount Spent',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgb(255, 235, 245)",
        'rgb(255, 186, 222)',
        'rgb(255, 114, 187)',
        'rgb(255, 48, 155)',
        'rgb(206, 28, 120)',
        'rgb(134, 14, 76)',
      ],
      radius: 150,
      borderWidth: 0,
    },
  ],
};

export const options = {
  plugins: {
    legend: {
      position: 'left' as const, 
      labels: {
        color: 'white', 
      },
    },
    layout: {
      autoPadding: false,
      padding: 0, //don't think this is even working
    }, 
  },
};

export const lineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Spending Trend',
      color: 'white',
      data: [100, 150, 200, 250, 300, 350],
      borderColor: 'lightpink',
      backgroundColor: 'lightpink',
      tension: 0.4, // curve smoothness
      pointBackgroundColor: 'lightpink',
    },
  ],
};

const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: { 
      display: true ,
      labels: {
        color: 'white', 
      },
    },
    annotation: {
      annotations: {
        refLine: {
          type: 'line' as const,
          yMin: 250, // budget reference value (horizontal line)
          yMax: 250,
          borderColor: 'rgb(206, 28, 120)',
          borderWidth: 2,
          label: {
            content: 'Set Budget',
            enabled: true,
            position: 'end' as const,
            backgroundColor: 'green',
            color: 'white',
            padding: 4,
          },
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'white', 
      },
      grid: {
        color: 'white', 
      },
    },
    y: {
      ticks: {
        color: 'white', 
      },
      grid: {
        color: 'white', 
      },
    },
  },
};


// const [isActive, setIsActive] = useState(false);

// const toggleButton = () => {
//   setIsActive(prev => !prev);
// };

export default function Dashboard() {

  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionAdded, setTransactionAdded] = useState(false);


  interface Expense {
    _id: string,
    name: string;
    price: number;
    date: string;
    vendor: string;
    category: string;
  };


  const submitTransaction = async(e: any) => {
    try {
      e.preventDefault();
    
      try {
          const response = await fetch("/api/transactions", { 
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, price, date, vendor, category}),
          });
          
          if (response.ok) {
            setTransactionAdded(true);
          }
      } catch (error) {
          console.error("Error submitting transaction:", error);
      }      
    } catch (err) {
      alert("Fields cannot be blank!");
    }
  }

  const [expenses, setExpenses] = useState<Expense[]>([]);

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

  useEffect(() => {
    fetchExpenses();
    if (transactionAdded) {
      setTransactionAdded(false);

      setName('');
      setPrice('');
      setDate('');
      setVendor('');
      setCategory('');
    }
  }, [transactionAdded]);

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



    return (
      
      <div className="main">
      <div className="row">
        <div className="column left1">
          <h1>Filter</h1>


          <div className="button-container">
          
              <div className="filter">
                <button className="button">Savings</button>
                <button className="button">Groceries</button>
                <button className="button">For funsies</button>
              </div>

              <div className="filter">
                <button className="button">Housing</button>
                <button className="button">Health</button>
                <button className="button">Transport</button>
              </div>

              <div className="filter">
                <button className="button">Misc</button>
              </div>

          </div>


          <div className="subtext">Looks like you are on track to hitting your savings goal! Keep it up girlie!</div>

        </div>

        <div className="column right1">

          
          <h1>Recent Transactions</h1>

          <ul>
          {expenses.length === 0 ? (
            <li>No recent expenses</li>
          ) : (
            expenses.map((expense) => (
              <li key={expense._id}>
                <div><strong>Name:</strong> {expense.name}</div>
                <div><strong>Price:</strong> ${expense.price.toFixed(2)}</div>
                <div><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</div>
                <div><strong>Vendor:</strong> {expense.vendor}</div>
                <div><strong>Category:</strong> {expense.category}</div>
                {/* <button className="deleteButton" onClick={() => deleteTransaction(expense._id)}>Delete</button> {} */}
              </li>
            ))
          )}
        </ul>
            

        </div>

      </div>
      <br></br>
      <div className="row2" >
        <div className="column left2">
          {/* line chart for goals */}
          <div className="line-chart-container">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
        <div className="column right2">
        <Doughnut data={data} options={options} />

        </div>

        {/* <div className="column left">

          
        </div>
        <div className="column right">

        </div> */}
      </div>
      
        <script src="dashboard.js"></script>

        {/* <script>
        document.addEventListener('DOMContentLoaded', function () {
          const buttons = document.querySelectorAll('.button');

          buttons.forEach(button => {
            button.addEventListener('click', () => {
              button.classList.toggle('active');
            });
          });
        });
      </script> */}


      </div>


    );
  }
