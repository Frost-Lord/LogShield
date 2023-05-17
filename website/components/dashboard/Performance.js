/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import Card from './Card';
import Chart from 'chart.js/auto';
import styles from "../../styles/Performance.module.css";

const Performance = () => {
  const chartRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);
  const data = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
        {
          label: 'Requests',
          data: [50, 100, 150, 180, 90, 120, 200],
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
        display: false,
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
        data: data,
        options: options,
      });
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartRef, data, options]);

  return (
    <Card title="Performance:">
      <div className={styles.chartContainer}>
        <canvas ref={chartRef} />
      </div>
    </Card>
  );
};

export default Performance;
