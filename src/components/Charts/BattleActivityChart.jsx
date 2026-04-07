import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

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
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: 'var(--color-border)',
            borderWidth: 1,
            padding: 10,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
                color: '#9ca3af',
            },
        },
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#9ca3af',
            },
        },
    },
    elements: {
        bar: {
            borderRadius: 4,
        },
    },
};

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const data = {
    labels,
    datasets: [
        {
            label: 'Battles',
            data: [342, 389, 412, 378, 456, 523, 489],
            backgroundColor: '#22d3ee',
        },
    ],
};

const BattleActivityChart = () => {
    return <Bar options={options} data={data} />;
};

export default BattleActivityChart;
