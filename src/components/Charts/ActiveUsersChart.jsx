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
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                borderWidth: 3,
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
