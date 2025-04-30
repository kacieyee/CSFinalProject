'use client';
import React, { useEffect, useState, useMemo } from 'react';``
import styles from './dashboard.module.css';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, ArcElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import Link from 'next/link';
import { color } from 'chart.js/helpers';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, annotationPlugin, ArcElement);

const generateGradientColors = (numColors: number): string[] => {
  const hue = 330;
  const saturation = 100;
  const startLightness = 86;
  const endLightness = 31;

  const colors: string[] = [];

  for (let i = 0; i < numColors; i++) {
    const ratio = i / Math.max(numColors - 1, 1);
    const lightness = Math.round(startLightness * (1 - ratio) + endLightness * ratio);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
};

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
  goal: number;
  interval: string;
}

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [doughnutData, setDoughnutData] = useState<any>(null);
    const [monthlySums, setMonthlySums] = useState<number[]>([]);
    const [monthlyLabels, setMonthlyLabels] = useState<string[]>([]);
    const [allBudgetItems, setAllBudgetItems] = useState<BudgetItem[]>([]);
    const [totalExpenseLimit, setTotalExpenseLimit] = useState<number | null>(null);
    const [activeCategories, setActiveCategories] = useState<string[]>([]);
    const [groupedCategories, setGroupedCategories] = useState<string[][]>([]);
    const [motivationMessage, setMotivationMessage] = useState("");
    const [percentage, setPercentage] = useState(Number);

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
            setAllBudgetItems(data.expenses);
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
        const sortedTransactions = [...filteredTransactions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        setRecentTransactions(sortedTransactions);
      } else {
        setRecentTransactions([]);
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
            
        const categoryPairs = visibleCategories.map(category => ({
          category,
          value: categoryTotals[category] || 0
        }));

        categoryPairs.sort((a, b) => b.value - a.value);

        const sortedLabels = categoryPairs.map(pair => pair.category);
        const sortedData = categoryPairs.map(pair => pair.value);
        const hasNonZeroData = sortedData.some(val => val > 0);
        const gradientColors = generateGradientColors(sortedLabels.length);
    
        if (hasNonZeroData) {
          setDoughnutData({
            labels: sortedLabels,
            datasets: [
              {
                label: "Spending Breakdown",
                data: sortedData,
                // backgroundColor: sortedLabels.map(category => hashColor(category)),
                backgroundColor: gradientColors,
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
    
    const getIntervalCoefficient = (interval: string): number => {
      switch (interval.toLowerCase()) {
        case 'daily':
          return 30
        case 'weekly':
          return 4;
        case 'biweekly':
          return 2;
        case 'monthly':
          return 1;
        case 'yearly':
          return 1 / 12;
        default:
          return 1;
      }
    };

    useEffect(() => {
      const customVisible = visibleCategories.filter(
        (cat) => !["total expenses", "temp total"].includes(cat.toLowerCase())
      );
    
      if (customVisible.length === 1) {
        const matching = allBudgetItems.find(
          (item) => item.category === customVisible[0]
        );
        if (matching) {
          const monthlyAdjusted = matching.goal * getIntervalCoefficient(matching.interval);
          setTotalExpenseLimit(monthlyAdjusted);
        }
      } else {
        const total = allBudgetItems.find(
          (item) => item.category.toLowerCase() === "total expenses"
        );
        if (total) {
          const monthlyAdjusted = total.goal * getIntervalCoefficient(total.interval);
          setTotalExpenseLimit(monthlyAdjusted);
        }
      }
    }, [visibleCategories, allBudgetItems]);

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
    
      setPercentage((monthlyTotal / totalExpenseLimit) * 100);
    
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
      
      <div className={styles.main}>
      <div className={styles.row}>
        <div className={`${styles.column} ${styles.left1}`}>
          <h1>Filter</h1>
          <div className={styles["button-container"]}>
            {groupedCategories.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.filter}>
                {row.map((category, index) => (
                  <button
                    key={index}
                    className={`${styles.button} ${activeCategories.includes(category) ? styles.active : ''}`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className={styles.subtext}>{motivationMessage}</div>

        </div>

        <div className={`${styles.column} ${styles.right1}`}>
          
          <h1>Recent Transactions</h1>
          <ul className={`${styles.ul} ${styles["text-white"]}`}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn, index) => (
                <li className={styles.li} key={index}>
                  {txn.name} (${txn.price.toFixed(2)}) on {new Date(txn.date).toLocaleDateString('en-US', {timeZone: 'UTC'})}.
                </li>
              ))
            ) : (
              <li className={styles.li}>No recent transactions.</li>
            )}
          </ul>

          <Link href="/allExpenses">
          <p className={`${styles.p} ${styles["view-all-expenses"]}`}>
          View all expenses
          </p>
          </Link>
        </div>

      </div>
      <br></br>
      <div className={styles.row2}>
        <div className={`${styles.column} ${styles.left2}`}>
          {/* line chart for goals */}
          <div className={styles["line-chart-container"]}>
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
                          content: `Goal: $${totalExpenseLimit.toFixed(2)}\n(${percentage.toFixed(1)}% there!)`,
                          display: true,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          font: {
                            weight: 'bold'
                          },
                          padding: 8,
                          position: 'end',
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
        <div className={`${styles.column} ${styles.right2}`}>

        {doughnutData ? (
          <Doughnut data={doughnutData} options={options} />
        ) : (
          <p className={styles.p}></p>
        )}

        </div>

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
