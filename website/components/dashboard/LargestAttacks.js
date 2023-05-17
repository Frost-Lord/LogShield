import React from 'react';
import Card from './Card';
import { Chart } from 'chart.js/auto';
import styles from "../../styles/Performance.module.css";

const mergeTotalblockedData = (data) => {
  if (!data) {
    console.error('Data is undefined');
    return {};
  }
  const mergedData = data.reduce((acc, nodeData) => {
    if (nodeData.rateLimit && nodeData.rateLimit.Totalblocked) {
      for (let [key, value] of Object.entries(nodeData.rateLimit.Totalblocked)) {
        if (!acc[key]) {
          acc[key] = value;
        } else {
          acc[key] += value;
        }
      }
    }
    acc["2023-05-14"] = 1 //remove this later
    return acc;
  }, {});

  return mergedData;
}

const LargestAttacks = ({ data }) => {
  const chartRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);
  
  const mergedData = mergeTotalblockedData(data);

  const chartData = {
    labels: Object.keys(mergedData),
    datasets: [
      {
        label: 'Amount',
        data: Object.values(mergedData),
        fill: false,
        backgroundColor: 'transparent',
        borderColor: '#1c80d8',
        pointBackgroundColor: '#1c80d8',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        type: 'category',
      },
    },
    elements: {
      point: {
        radius: 4,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
    },
    maintainAspectRatio: false,
  };

  React.useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'line',
        data: chartData,
        options: options,
      });
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartRef, chartData, options]);

  return (
    <Card title="Requests Blocked:">
      <div className={styles.chartContainer}>
        <canvas ref={chartRef} />
      </div>
    </Card>
  );
};

export default LargestAttacks;