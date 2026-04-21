import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

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

const defaultDistribution = { Easy: 45, Medium: 35, Hard: 20, Expert: 0 };

const DifficultyChart = ({ distribution = defaultDistribution }) => {
    const { t } = useTranslation();
    const keys = ['Easy', 'Medium', 'Hard', 'Expert'];
    const labels = [t('charts.easy'), t('charts.medium'), t('charts.hard'), t('charts.expert')];
    const values = keys.map((key) => Number(distribution?.[key] || 0));
    const data = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    '#22c55e',
                    '#facc15',
                    '#ef4444',
                    '#a855f7',
                ],
                borderColor: '#0f172a',
                borderWidth: 2,
            },
        ],
    };

    return <Doughnut data={data} options={options} />;
};

export default DifficultyChart;
