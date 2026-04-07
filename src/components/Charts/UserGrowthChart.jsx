import React from 'react';
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
import { Line } from 'react-chartjs-2';

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
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: 'var(--color-border)',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
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
                color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
                color: '#9ca3af',
                maxTicksLimit: 10,
            },
        },
    },
    elements: {
        line: {
            tension: 0.4,
        },
        point: {
            radius: 0,
            hoverRadius: 4,
        }
    },
};

const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);

const data = {
    labels,
    datasets: [
        {
            label: 'New Users',
            data: [120, 145, 168, 152, 189, 210, 184, 195, 220, 235, 248, 260, 275, 290, 305, 320, 335, 350, 365, 380, 395, 410, 425, 440, 455, 470, 485, 500, 515, 530],
            borderColor: '#22d3ee',
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            fill: true,
        },
    ],
};

const UserGrowthChart = () => {
    return <Line options={options} data={data} />;
};

export default UserGrowthChart;
