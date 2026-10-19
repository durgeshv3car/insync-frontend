'use client'
import React, { useState, useEffect, useMemo } from 'react'
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

    const { totalImpressions, avgCtr } = useMemo(() => {
        const dataArray = Array.isArray(dailyReportsData)
            ? dailyReportsData
            : dailyReportsData?.data || [];
        
        let sumImpressions = 0;
        let sumClicks = 0;

        dataArray.forEach((item) => {
            sumImpressions += Number(item.impressions) || 0;
            sumClicks += Number(item.clicks) || 0;
        });

        const calculatedCtr = sumImpressions > 0 
            ? ((sumClicks / sumImpressions) * 100).toFixed(2) + "%"
            : "0.00%";

        return {
            totalImpressions: sumImpressions,
            avgCtr: calculatedCtr,
        };
    }, [dailyReportsData]);

    const formatCompact = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toLocaleString();
    };

    const { refreshKey, isRemoved, isExpanded } = useCardTitleActions();
    if (isRemoved) {
        return null;
    }

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <div className={`card leads-overview chart-analytics-card ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`} style={{ marginBottom: 0 }}>
                {/* Header: Title & Top Legend */}
                <div className="chart-card-header">
                    <h3 className="chart-card-title">Impression &amp; CTR</h3>
                    <div className="chart-top-legend">
                        <span className="chart-top-legend-item">
                            <span className="chart-legend-dot impressions" />
                            <span>Impressions</span>
                        </span>
                        <span className="chart-top-legend-item">
                            <svg className="chart-legend-line-icon" width="18" height="12" viewBox="0 0 18 12" fill="none">
                                <line x1="0" y1="6" x2="18" y2="6" stroke="#00d2b4" strokeWidth="2" />
                                <circle cx="9" cy="6" r="3" fill="#ffffff" stroke="#00d2b4" strokeWidth="2" />
                            </svg>
                            <span>CTR (%)</span>
                        </span>
                    </div>
                </div>

                {/* Axis Labels on Top of Chart */}
                <div className="chart-axis-headers-row">
                    <span className="chart-axis-header impressions">Impressions</span>
                    <span className="chart-axis-header ctr">CTR (%)</span>
                </div>

                {/* Chart Area */}
                <div className="chart-canvas-wrapper">
                    <ReactApexChart
                        key={theme}
                        type='area'
                        options={chartOptions}
                        series={chartOptions.series}
                        height={340}
                    />
                </div>

                {/* Bottom Summary Badges / Pills */}
                <div className="chart-summary-pills-row">
                    <div className="chart-summary-pill impressions">
                        <span className="pill-dot impressions">●</span>
                        <span className="pill-label">Impressions</span>
                        <span className="pill-value">{formatCompact(totalImpressions)}</span>
                    </div>
                    <div className="chart-summary-pill ctr">
                        <svg className="pill-line-icon" width="18" height="12" viewBox="0 0 18 12" fill="none">
                            <line x1="0" y1="6" x2="18" y2="6" stroke="#00d2b4" strokeWidth="2" />
                            <circle cx="9" cy="6" r="3" fill="#ffffff" stroke="#00d2b4" strokeWidth="2" />
                        </svg>
                        <span className="pill-label">Avg. CTR</span>
                        <span className="pill-value">{avgCtr}</span>
                    </div>
                </div>

                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default VisitorsChart