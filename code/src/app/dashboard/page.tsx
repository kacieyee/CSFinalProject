'use client';
import React, { useEffect, useState } from 'react';``
import './dashboard.css';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, ArcElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { color } from 'chart.js/helpers';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, annotationPlugin, ArcElement);

const hashColor = (str: string) => {
  if (!str) return "#ccc";

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = 325;
  const saturation = 55 + (hash % 25);
  const lightness = 55 + (hash % 25);

  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  return color;
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

interface Transaction {
  name: string;
  price: number;
  date: string;
  vendor: string;
  category: string;
}

interface BudgetItem {
  category: string;
}

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgetCategories, setBudgetCategories] = useState<string[]>([]);
    const [doughnutData, setDoughnutData] = useState<any>(null);

    useEffect(() => {
      const fetchTransactions = async () => {
        try {
          const response = await fetch("/api/transactions", {
            method: "GET",
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            const sortedTransactions = data.expenses
              .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5);
            setTransactions(sortedTransactions);
          }
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      };

      const fetchBudget = async () => {
        try {
          const response = await fetch("/api/budget", {
            method: "GET",
            credentials: "include",
          });
  
          if (response.ok) {
            const data = await response.json();
            const categories = data.expenses.map((item: BudgetItem) => item.category);
            setBudgetCategories(categories);
          }
        } catch (error) {
          console.error("Error fetching budget:", error);
        }
      };
  
      fetchTransactions();
      fetchBudget();
    }, []);

    useEffect(() => {
      if (budgetCategories.length > 0 && transactions.length > 0) {
        const filteredCategories = budgetCategories.filter(
          (category) => !["total expenses", "temp total"].includes(category.toLowerCase())
        );

        const categoryTotals: { [key: string]: number } = {};
        
        filteredCategories.forEach(category => {
          categoryTotals[category] = 0;
        });
    
        transactions.forEach(txn => {
          if (categoryTotals.hasOwnProperty(txn.category)) {
            categoryTotals[txn.category] += txn.price;
          }
        });
    
        setDoughnutData({
          labels: filteredCategories,
          datasets: [
            {
              label: "Spending Breakdown",
              data: filteredCategories.map(category => categoryTotals[category] || 0),
              backgroundColor: filteredCategories.map(category => hashColor(category)),
              borderWidth: 0,
            },
          ],
        });
      }
    }, [budgetCategories, transactions]);

    const visibleCategories = budgetCategories.filter(
      (category) => !["total expenses", "temp total"].includes(category.toLowerCase())
    );

    const groupedCategories = visibleCategories.reduce((acc: string[][], category, index) => {
      if (index % 3 === 0) acc.push([]);
      acc[acc.length - 1].push(category);
      return acc;
    }, []);

    return (
      
      <div className="main">
      <div className="row">
        <div className="column left1">
          <h1>Filter</h1>
          <div className="button-container">
          {groupedCategories.map((row, rowIndex) => (
            <div key={rowIndex} className="filter">
              {row.map((category, index) => (
                <button key={index} className="button">{category}</button>
              ))}
            </div>
          ))}
        </div>

          <div className="subtext">Looks like you are on track to hitting your savings goal! Keep it up girlie!</div>

        </div>

        <div className="column right1">
          
          <h1>Recent Transactions</h1>
          <ul className="text-white">
            {transactions.length > 0 ? (
              transactions.map((txn, index) => (
                <li key={index}>
                  {txn.name} (${txn.price.toFixed(2)}) on {new Date(txn.date).toLocaleDateString()}.
                </li>
              ))
            ) : (
              <li>No recent transactions.</li>
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

        {doughnutData ? (
          <Doughnut data={doughnutData} options={options} />
        ) : (
          <p></p>
        )}

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
