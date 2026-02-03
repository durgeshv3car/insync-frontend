'use client'
import React from 'react'
import CardHeader from '@/components/shared/CardHeader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'
import { topCountryBarChartOptions } from '@/utils/chartsLogic/topCountryBarChartOptionsGender'
import dynamic from 'next/dynamic'
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })


const TopCountryBarChart = ({dailyReportsData,activeMetric}) => {
    const chartOptions = topCountryBarChartOptions(dailyReportsData,activeMetric)
    console.log("dailyReportsData in TopCountryBarChart:", activeMetric);
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    if (isRemoved) {
        return null;
    }
    return (
        <div>
            <div className={`card stretch stretch-full leads-overview ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={"Gender Level Performance"} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />

                <div className="card-body custom-card-action p-0">
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
