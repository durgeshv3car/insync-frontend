'use client'
import React, { useState } from 'react'
import CardHeader from '@/components/shared/CardHeader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'
import { topCountryBarChartOptions } from '@/utils/chartsLogic/topCountryBarChartOptionsGender'
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })


const TopCountryBarChart = ({dailyReportsData, audienceName}) => {
    const [activeMetric, setActiveMetric] = useState("Impressions");
    const chartOptions = topCountryBarChartOptions(dailyReportsData,activeMetric)
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    if (isRemoved) {
        return null;
    }
    return (
        <div>
            <div
                className={`card stretch stretch-full leads-overview ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}
                style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-primary)",
                }}
            >
                <div
                    className="card-header d-flex justify-content-between align-items-center"
                    style={{
                        backgroundColor: "transparent",
                        borderBottom: "1px solid var(--card-border)",
                    }}
                >
                    <h5
                        className="card-title mb-0"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Gender Level Performance
                    </h5>
                    <div className="d-flex gap-1">
                        {["Impressions", "VCR", "CTR"].map((m) => (
                            <button
                                key={m}
                                onClick={() => setActiveMetric(m)}
                                style={{
                                    padding: "2px 10px",
                                    fontSize: "10px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--card-border)",
                                    background: activeMetric === m ? "#3454d1" : "var(--input-bg)",
                                    color: activeMetric === m ? "#ffffff" : "var(--text-secondary)",
                                    fontWeight: "600",
                                    transition: "all 0.2s",
                                    cursor: "pointer",
                                }}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card-body custom-card-action p-0" style={{ height: "300px" }}>
                    <ReactApexChart
                        type='bar'
                        options={chartOptions}
                        series={chartOptions.series}
                        height={"100%"}
                    />
                </div>

                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default TopCountryBarChart
