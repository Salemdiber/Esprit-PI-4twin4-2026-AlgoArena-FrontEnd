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
import { useTranslation } from 'react-i18next';

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
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            titleColor: '#f3f4f6',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(34, 211, 238, 0.35)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
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
                font: { size: 11, weight: 600 },
            },
        },
        y: {
            grid: {
                color: 'rgba(148, 163, 184, 0.12)',
                drawBorder: false,
            },
            ticks: {
                color: '#9ca3af',
                font: { size: 11, weight: 600 },
            },
            beginAtZero: true,
        },
    },
    elements: {
        bar: {
            borderRadius: 10,
            borderSkipped: false,
        },
    },
};

const defaultLabels = ['Two Sum', 'Bin. Tree', 'Linked List', 'Graph BFS', 'DP Coin'];
const defaultValues = [1250, 980, 860, 650, 430];
const defaultColors = [
    ['rgba(34, 211, 238, 0.95)', 'rgba(14, 165, 233, 0.45)'],
    ['rgba(168, 85, 247, 0.95)', 'rgba(124, 58, 237, 0.45)'],
    ['rgba(34, 197, 94, 0.95)', 'rgba(16, 185, 129, 0.45)'],
    ['rgba(234, 179, 8, 0.95)', 'rgba(245, 158, 11, 0.45)'],
    ['rgba(244, 63, 94, 0.95)', 'rgba(225, 29, 72, 0.45)'],
];

const makeBarGradient = (context, index) => {
    const { chart } = context;
    const { ctx, chartArea } = chart;
    const colors = defaultColors[index % defaultColors.length];
    if (!chartArea) return colors[0];
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
};

const GamesChart = ({ labels = defaultLabels, values = defaultValues, datasetLabel: datasetLabelProp }) => {
    const { t } = useTranslation();
    const datasetLabel = datasetLabelProp || t('charts.plays');
    const data = {
        labels,
        datasets: [
            {
                label: datasetLabel,
                data: values,
                backgroundColor: (context) => makeBarGradient(context, context.dataIndex || 0),
                hoverBackgroundColor: labels.map((_, index) => defaultColors[index % defaultColors.length][0]),
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderWidth: 1,
                maxBarThickness: 54,
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
