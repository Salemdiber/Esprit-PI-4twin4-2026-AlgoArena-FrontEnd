import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#9ca3af',
                padding: 20,
                font: {
                    family: "'Inter', sans-serif"
                }
            },
        },
        tooltip: {
            backgroundColor: 'var(--color-bg-secondary)',
            bodyColor: '#e2e8f0',
            borderColor: 'var(--color-border)',
            borderWidth: 1,
            padding: 10,
        },
    },
    cutout: '70%',
    borderWidth: 0,
};

const data = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
        {
            data: [45, 35, 20],
            backgroundColor: [
                '#22c55e', // Green
                '#facc15', // Yellow
                '#ef4444', // Red
            ],
            borderColor: '#0f172a', /* Match card background to create spacing effect if needed */
            borderWidth: 2,
        },
    ],
};

const DifficultyChart = () => {
    return <Doughnut data={data} options={options} />;
};

export default DifficultyChart;
