'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'
import { visitorChartOption } from '@/utils/chartsLogic/visitorChartOption'
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const VisitorsChart = ({ dailyReportsData }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof document !== "undefined") {
            return document.documentElement.getAttribute("data-theme") || "dark";
        }
        return "dark";
    });

    useEffect(() => {
        const updateTheme = () => {
            const current = document.documentElement.getAttribute("data-theme") || "dark";
            setTheme(current);
        };
        updateTheme();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "data-theme"
                ) {
                    updateTheme();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        return () => observer.disconnect();
    }, []);

    const chartOptions = visitorChartOption(dailyReportsData, theme);

    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
    if (isRemoved) {
        return null;
    }

    return (
        <div>
            <div className={`card stretch stretch-full leads-overview ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={"Impression & CTR"} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />
                <div className="card-body custom-card-action">
                    <ReactApexChart
                        key={theme}
                        type='area'
                        options={chartOptions}
                        series={chartOptions.series}
                        height={350}
                    />
                </div>

                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default VisitorsChart