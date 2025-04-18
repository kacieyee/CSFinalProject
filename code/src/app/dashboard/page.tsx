'use client';
import React, { useEffect, useState, useMemo } from 'react';``
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
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [doughnutData, setDoughnutData] = useState<any>(null);
    const [monthlySums, setMonthlySums] = useState<number[]>([]);
    const [monthlyLabels, setMonthlyLabels] = useState<string[]>([]);
    const [totalExpenseLimit, setTotalExpenseLimit] = useState<number | null>(null);
    const [activeCategories, setActiveCategories] = useState<string[]>([]);
    const [groupedCategories, setGroupedCategories] = useState<string[][]>([]);
    const [motivationMessage, setMotivationMessage] = useState("");

    const groupCategories = (categories: string[]) => {
      return categories.reduce((acc: string[][], category, index) => {
        if (index % 3 === 0) acc.push([]);
        acc[acc.length - 1].push(category);
        return acc;
      }, []);
    };

    useEffect(() => {
      const fetchTransactions = async () => {
        try {
          const response = await fetch("/api/transactions", {
            method: "GET",
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            setTransactions(data.expenses);
            const allTransactions = data.expenses;

            const filteredTransactions = allTransactions.filter(txn =>
              visibleCategories.includes(txn.category)
            );
    
            const sortedTransactions = filteredTransactions
              .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5);
    
            setRecentTransactions(sortedTransactions);
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
      
            const total = data.expenses.find((item: BudgetItem) => item.category.toLowerCase() === "total expenses");
            if (total) {
              setTotalExpenseLimit(total.goal);
            }
      
            setActiveCategories(categories);

            const filteredCategories = data.expenses
              .map((item: BudgetItem) => item.category)
              .filter((cat) => !["total expenses", "temp total"].includes(cat.toLowerCase()))
            setGroupedCategories(groupCategories(filteredCategories));
          }
        } catch (error) {
          console.error("Error fetching budget:", error);
        }
      };
      
  
      fetchTransactions();
      fetchBudget();
    }, []);

    const visibleCategories = useMemo(() => {
      return activeCategories.filter(
        (category) => !["total expenses", "temp total"].includes(category.toLowerCase())
      );
    }, [activeCategories]);

    const filteredTransactions = useMemo(() => {
      return transactions.filter(txn =>
        visibleCategories.includes(txn.category)
      );
    }, [transactions, visibleCategories]);    

    const filteredAllTransactions = useMemo(() => {
      return transactions.filter(txn =>
        visibleCategories.includes(txn.category)
      );
    }, [transactions, visibleCategories]);
    
    useEffect(() => {
      if (filteredTransactions.length > 0) {
        const sortedTransactions = filteredTransactions
          .sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        setRecentTransactions(sortedTransactions);
      }
    }, [filteredTransactions]);

    useEffect(() => {
      if (visibleCategories.length > 0 && transactions.length > 0) {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
        const recentTransactions = transactions.filter(txn => {
          const txnDate = new Date(txn.date);
          return txnDate >= sixMonthsAgo && visibleCategories.includes(txn.category);
        });
    
        const categoryTotals: { [key: string]: number } = {};
        visibleCategories.forEach(category => {
          categoryTotals[category] = 0;
        });
    
        recentTransactions.forEach(txn => {
          if (categoryTotals.hasOwnProperty(txn.category)) {
            categoryTotals[txn.category] += txn.price;
          }
        });
    
        const dataValues = visibleCategories.map(category => categoryTotals[category] || 0);
        const hasNonZeroData = dataValues.some(val => val > 0);
    
        if (hasNonZeroData) {
          setDoughnutData({
            labels: visibleCategories,
            datasets: [
              {
                label: "Spending Breakdown",
                data: dataValues,
                backgroundColor: visibleCategories.map(category => hashColor(category)),
                borderWidth: 0,
              },
            ],
          });
        } else {
          setDoughnutData({
            labels: ["No data"],
            datasets: [
              {
                label: "Spending Breakdown",
                data: [1],
                backgroundColor: ["#555"],
                borderWidth: 0,
              },
            ],
          });
        }
      } else {
        setDoughnutData({
          labels: ["No data"],
          datasets: [
            {
              label: "Spending Breakdown",
              data: [1],
              backgroundColor: ["#555"],
              borderWidth: 0,
            },
          ],
        });
      }
    }, [visibleCategories, transactions]);    

    useEffect(() => {
      const monthSums: { [month: string]: number } = {};
    
      const now = new Date();
      const monthsToShow = 6;
      const monthKeys: string[] = [];
    
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthKeys.push(key);
        monthSums[key] = 0;
      }
    
      filteredAllTransactions.forEach((txn) => {
        const utcDate = new Date(txn.date);
        const localDate = new Date(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate()
        );
        const key = localDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (monthSums.hasOwnProperty(key)) {
          monthSums[key] += txn.price;
        }
      });
    
      setMonthlyLabels(monthKeys);
      setMonthlySums(monthKeys.map(month => monthSums[month]));
    }, [visibleCategories]);

    const toggleCategory = (category: string) => {
      setActiveCategories((prevActiveCategories) => {
        if (prevActiveCategories.includes(category)) {
          return prevActiveCategories.filter((cat) => cat !== category);
        } else {
          return [...prevActiveCategories, category];
        }
      });
    };

    useEffect(() => {
      if (!totalExpenseLimit || transactions.length === 0) return;
    
      const latestTxn = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
    
      const latestMonth = new Date(latestTxn.date).getMonth();
      const latestYear = new Date(latestTxn.date).getFullYear();
    
      const monthlyTotal = transactions.reduce((sum, txn) => {
        const txnDate = new Date(txn.date);
        if (
          txnDate.getMonth() === latestMonth &&
          txnDate.getFullYear() === latestYear &&
          visibleCategories.includes(txn.category)
        ) {
          return sum + txn.price;
        }
        return sum;
      }, 0);
    
      const percentage = (monthlyTotal / totalExpenseLimit) * 100;
    
      let message = "";
    
      if (percentage < 50) {
        message = "You’re spending way under budget! Treat yourself a little!";
      } else if (percentage < 90) {
        message = "Keep it up girlie! You’re on track!";
      } else if (percentage < 100) {
        message = "Almost at your budget! Slow it down girlie!";
      } else {
        message = "Careful! You’ve gone over budget this month!";
      }
    
      setMotivationMessage(message);
    }, [transactions, totalExpenseLimit, visibleCategories]);

    return (
      
      <div className="main">
      <div className="row">
        <div className="column left1">
          <h1>Filter</h1>
          <div className="button-container">
            {groupedCategories.map((row, rowIndex) => (
              <div key={rowIndex} className="filter">
                {row.map((category, index) => (
                  <button
                    key={index}
                    className={`button ${activeCategories.includes(category) ? 'active' : ''}`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="subtext">{motivationMessage}</div>

        </div>

        <div className="column right1">
          
          <h1>Recent Transactions</h1>
          <ul className="text-white">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn, index) => (
                <li key={index}>
                  {txn.name} (${txn.price.toFixed(2)}) on {new Date(txn.date).toLocaleDateString('en-US', {timeZone: 'UTC'})}.
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
            <Line
              data={{
                labels: monthlyLabels,
                datasets: [
                  {
                    label: 'Monthly Spending',
                    data: monthlySums,
                    borderColor: 'lightpink',
                    backgroundColor: 'lightpink',
                    tension: 0,
                    pointBackgroundColor: 'lightpink',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { 
                    display: true,
                    labels: {
                      color: 'white', 
                    },
                  },
                  annotation: totalExpenseLimit !== null ? {
                    annotations: {
                      refLine: {
                        type: 'line' as const,
                        yMin: totalExpenseLimit,
                        yMax: totalExpenseLimit,
                        borderColor: 'rgb(206, 28, 120)',
                        borderWidth: 4,
                        label: {
                          content: 'Set Budget',
                          position: 'end' as const,
                          backgroundColor: 'green',
                          color: 'white',
                          padding: 4,
                        },
                      },
                    },
                  } : {},
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
              }}
            />


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
