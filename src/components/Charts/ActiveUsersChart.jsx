import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'var(--color-bg-secondary)',
            titleColor: '#f3f4f6',
            bodyColor: '#cbd5e1',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
                drawBorder: false,
            },
            ticks: {
                color: '#9ca3af',
            },
        },
        y: {
            grid: {
                color: 'rgba(55, 65, 81, 0.3)',
                drawBorder: false,
            },
            ticks: {
                color: '#9ca3af',
                stepSize: 50,
            },
            beginAtZero: true,
        },
    },
    elements: {
        line: {
            tension: 0.4, // smooth curve
        },
        point: {
            radius: 0,
            hoverRadius: 6,
        },
    },
};

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const data = {
    labels,
    datasets: [
        {
            fill: true,
            label: 'Active Users',
            data: [120, 190, 150, 220, 180, 250, 310],
            borderColor: '#22d3ee',
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            borderWidth: 3,
        },
    ],
};

const ActiveUsersChart = () => {
    return (
        <div className="h-full w-full p-2">
            <Line options={options} data={data} />
        </div>
    );
};

export default ActiveUsersChart;
