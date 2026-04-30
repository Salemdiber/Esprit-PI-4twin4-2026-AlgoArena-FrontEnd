import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend);

const centerTotalPlugin = {
    id: 'centerTotal',
    afterDraw(chart) {
        const dataset = chart.data.datasets?.[0];
        const total = (dataset?.data || []).reduce((sum, value) => sum + Number(value || 0), 0);
        const meta = chart.getDatasetMeta(0);
        const arc = meta?.data?.[0];
        if (!arc) return;

        const { ctx } = chart;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 22px Inter, system-ui, sans-serif';
        ctx.fillText(String(total), arc.x, arc.y - 6);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 10px Inter, system-ui, sans-serif';
        ctx.fillText('TOTAL', arc.x, arc.y + 16);
        ctx.restore();
    },
};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#9ca3af',
                padding: 16,
                usePointStyle: true,
                pointStyle: 'circle',
                font: {
                    family: "'Inter', sans-serif",
                    size: 11,
                    weight: 600,
                }
            },
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            bodyColor: '#e2e8f0',
            titleColor: '#f8fafc',
            borderColor: 'rgba(34, 211, 238, 0.35)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
        },
    },
    cutout: '74%',
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
                    'rgba(34, 197, 94, 0.95)',
                    'rgba(250, 204, 21, 0.95)',
                    'rgba(248, 113, 113, 0.95)',
                    'rgba(168, 85, 247, 0.95)',
                ],
                hoverBackgroundColor: [
                    '#4ade80',
                    '#fde047',
                    '#f87171',
                    '#c084fc',
                ],
                borderColor: 'rgba(15, 23, 42, 0.9)',
                borderWidth: 3,
                spacing: 3,
                borderRadius: 8,
            },
        ],
    };

    return <Doughnut data={data} options={options} plugins={[centerTotalPlugin]} />;
};

export default DifficultyChart;
