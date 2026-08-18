import { formatDate } from "../dateFormatter";

export const visitorChartOption = (dailyReportsData = [], theme = "dark") => {
  const isLight = theme === "light";
  const dataArray = Array.isArray(dailyReportsData)
    ? dailyReportsData
    : dailyReportsData?.data || [];

  const sorted = dataArray.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const categories = [];
  const impressionsSeries = [];
  const vcrSeries = [];

  sorted.forEach((item) => {
    const dateLabel = formatDate(item.date);
    categories.push(dateLabel);

    const impressions = Number(item.impressions) || 0;
    const completeViews = Number(item.completeViewsVideo) || 0;

    const vcr =
      impressions > 0
        ? ((completeViews / impressions) * 100).toFixed(2)
        : 0;

    impressionsSeries.push(impressions);
    vcrSeries.push(Number(vcr));
  });

  return {
    series: [
      { name: "Impressions", data: impressionsSeries },
      { name: "VCR (%)", data: vcrSeries },
    ],
    chart: {
      height: 350,
      type: "area",
      toolbar: { show: false },
      background: "transparent",
    },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#3454D1", "#FFA21D"],
    dataLabels: {
      enabled: false,
    },
    markers: isLight
      ? {
          size: 4,
          colors: ["#ffffff", "#ffffff"],
          strokeColors: ["#3454D1", "#FFA21D"],
          strokeWidth: 2,
          hover: {
            size: 6,
          },
        }
      : {
          size: 4,
          strokeWidth: 2,
          hover: {
            size: 6,
          },
        },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        colors: isLight ? "#334155" : "#cbd5e1",
        useSeriesColors: false,
      },
      markers: {
        width: 10,
        height: 10,
        radius: 10,
      },
      itemMargin: {
        horizontal: 14,
        vertical: 8,
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontFamily: "Inter",
          fontSize: "11px",
          colors: isLight ? "#64748b" : "#94a3b8",
        },
      },
      tooltip: {
        enabled: true,
        theme: isLight ? "light" : "dark",
      },
    },
    yaxis: [
      {
        title: {
          text: "Impressions",
          style: {
            color: isLight ? "#475569" : "#94a3b8",
            fontWeight: 600,
          },
        },
        labels: {
          formatter: (val) => Math.round(val).toLocaleString(),
          style: { colors: [isLight ? "#64748b" : "#94a3b8"] },
        },
      },
      {
        opposite: true,
        title: {
          text: "VCR %",
          style: {
            color: isLight ? "#475569" : "#94a3b8",
            fontWeight: 600,
          },
        },
        labels: {
          formatter: (val) => (typeof val === "number" ? val.toFixed(2) + "%" : val + "%"),
          style: { colors: [isLight ? "#64748b" : "#94a3b8"] },
        },
      },
    ],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    grid: {
      padding: { left: 0, right: 0 },
      strokeDashArray: 3,
      borderColor: isLight ? "#f1f5f9" : "rgba(255,255,255,0.12)",
    },
    theme: { mode: isLight ? "light" : "dark" },
    tooltip: {
      theme: isLight ? "light" : "dark",
      y: {
        formatter: function (val, { seriesIndex }) {
          if (seriesIndex === 0) {
            return val !== undefined ? Number(val).toLocaleString() : "";
          }
          return val !== undefined ? Number(val).toFixed(2) + "%" : "";
        },
      },
    },
  };
};
