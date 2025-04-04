'use client';
import './dashboard.css';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, ArcElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { color } from 'chart.js/helpers';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, annotationPlugin, ArcElement);


export const data = {
  labels: ['Pink', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: 'Amount Spent',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'lightpink',
        'lightblue',
        'papayawhip',
        'yellowgreen',
        'plum',
        'orange',
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
          borderColor: 'green',
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


export default function Dashboard() {
    return (
      
      <div className="row">
        <div className="column left">
          <h1>Filter</h1>

          <div className="button-container">
          
          {/* First Row */}
            <div className="filter">
              <button className="button">Savings</button>
              <button className="button">Groceries</button>
              <button className="button">For funsies</button>
            </div>

          {/* Second Row */}
            <div className="filter">
              <button className="button">Housing</button>
              <button className="button">Health</button>
              <button className="button">Transport</button>
            </div>

            {/* Third Row */}
            <div className="filter">
              <button className="button">Misc</button>
            </div>

          </div>

          <Doughnut data={data} options={options} />

          <div className="subtext">Looks like you are on track to hitting your savings goal! Keep it up girlie!</div>

        </div>

        <div className="column right">

        {/* line chart for goals */}
        <h1>Budget Goals</h1>
        <div className="line-chart-container">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>

          <h1>Recent Transactions</h1>
          <ul className="text-white">
            <li>Paid Rent: $1,200.00</li>
            <li>Received Salary: $3,000.00</li>
            <li>Grocery Shopping: $50.75</li>
          </ul>
        </div>

      </div>
    );
  }
