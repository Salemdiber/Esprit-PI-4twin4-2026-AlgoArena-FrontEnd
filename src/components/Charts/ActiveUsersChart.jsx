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
import { useTranslation } from 'react-i18next';

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
                stepSize: 50,
                font: { size: 11, weight: 600 },
            },
            beginAtZero: true,
        },
    },
    elements: {
        line: {
            tension: 0.4, // smooth curve
        },
        point: {
            radius: 3,
            hitRadius: 16,
            hoverRadius: 7,
        },
    },
};

const defaultValues = [120, 190, 150, 220, 180, 250, 310];

const ActiveUsersChart = ({ labels: labelsProp, values = defaultValues, label: labelProp }) => {
    const { t } = useTranslation();
    const labels = labelsProp || [t('charts.mon'), t('charts.tue'), t('charts.wed'), t('charts.thu'), t('charts.fri'), t('charts.sat'), t('charts.sun')];
    const label = labelProp || t('charts.activeUsers');
    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label,
                data: values,
                borderColor: '#22d3ee',
                backgroundColor: (context) => {
                    const { chart } = context;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return 'rgba(34, 211, 238, 0.14)';
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(34, 211, 238, 0.34)');
                    gradient.addColorStop(0.55, 'rgba(20, 184, 166, 0.12)');
                    gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
                    return gradient;
                },
                borderWidth: 3,
                pointBackgroundColor: '#0f172a',
                pointBorderColor: '#67e8f9',
                pointBorderWidth: 2,
            },
        ],
    };

    return (
        <div className="h-full w-full p-2">
            <Line options={options} data={data} />
        </div>
    );
};

export default ActiveUsersChart;
