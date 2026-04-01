import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
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
            },
            beginAtZero: true,
        },
    },
    elements: {
        bar: {
            borderRadius: 4,
        },
    },
};

const labels = ['Two Sum', 'Bin. Tree', 'Linked List', 'Graph BFS', 'DP Coin'];

const data = {
    labels,
    datasets: [
        {
            label: 'Plays',
            data: [1250, 980, 860, 650, 430],
            backgroundColor: [
                'rgba(34, 211, 238, 0.8)', // Cyan
                'rgba(168, 85, 247, 0.8)', // Purple
                'rgba(34, 197, 94, 0.8)',  // Green
                'rgba(234, 179, 8, 0.8)',  // Yellow
                'rgba(244, 63, 94, 0.8)',  // Red/Rose
            ],
            hoverBackgroundColor: [
                'rgba(34, 211, 238, 1)',
                'rgba(168, 85, 247, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(234, 179, 8, 1)',
                'rgba(244, 63, 94, 1)',
            ],
            borderWidth: 0,
        },
    ],
};

const GamesChart = () => {
    return (
        <div className="h-full w-full p-2">
            <Bar options={options} data={data} />
        </div>
    );
};

export default GamesChart;
