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

const defaultLabels = ['Two Sum', 'Bin. Tree', 'Linked List', 'Graph BFS', 'DP Coin'];
const defaultValues = [1250, 980, 860, 650, 430];
const defaultColors = [
    'rgba(34, 211, 238, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(234, 179, 8, 0.8)',
    'rgba(244, 63, 94, 0.8)',
];

const GamesChart = ({ labels = defaultLabels, values = defaultValues, datasetLabel = 'Plays' }) => {
    const data = {
        labels,
        datasets: [
            {
                label: datasetLabel,
                data: values,
                backgroundColor: labels.map((_, index) => defaultColors[index % defaultColors.length]),
                hoverBackgroundColor: labels.map((_, index) => defaultColors[index % defaultColors.length].replace('0.8', '1')),
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="h-full w-full p-2">
            <Bar options={options} data={data} />
        </div>
    );
};

export default GamesChart;
