import { formatDate } from "../dateFormatter";

export const visitorChartOption = (dailyReportsData = [], theme = "light") => {
  const isLight = theme === "light";
  const dataArray = Array.isArray(dailyReportsData)
    ? dailyReportsData
    : dailyReportsData?.data || [];

  const sorted = [...dataArray].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const categories = [];
  const impressionsSeries = [];
  const ctrSeries = [];

  sorted.forEach((item) => {
    const dateLabel = formatDate(item.date);
    categories.push(dateLabel);

    const impressions = Number(item.impressions) || 0;
    const ctr = item.ctr ? parseFloat(item.ctr.replace("%", "")) : 0;

    impressionsSeries.push(impressions);
    ctrSeries.push(ctr);
  });

  const impressionsColor = isLight ? "#7c3aed" : "#8b5cf6";
  const ctrColor = isLight ? "#00d2b4" : "#00e5bf";

  return {
    series: [
      { name: "Impressions", type: "area", data: impressionsSeries },
      { name: "CTR (%)", type: "area", data: ctrSeries },
    ],
    chart: {
      height: 340,
      type: "area",
      toolbar: { show: false },
      background: "transparent",
      stacked: false,
      animations: { enabled: true, speed: 450 },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: [2.5, 2.5],
    },
    colors: [impressionsColor, ctrColor],
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        shade: isLight ? "light" : "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: [0.48, 0.58],
        opacityTo: [0.08, 0.14],
        stops: [0, 85, 100],
      },
    },
    markers: {
      size: [4.5, 4.5],
      colors: [impressionsColor, "#ffffff"],
      strokeColors: ["#ffffff", ctrColor],
      strokeWidth: [2, 2],
      strokeOpacity: 1,
      fillOpacity: 1,
      hover: { size: 7, sizeOffset: 2 },
    },
    legend: { show: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: {
          fontFamily: "Inter, sans-serif",
          fontSize: "10px",
          fontWeight: 500,
          colors: isLight ? "#64748b" : "#94a3b8",
        },
      },
      tooltip: { enabled: false },
    },
    yaxis: [
      {
        seriesName: "Impressions",
        title: { text: undefined },
        labels: {
          formatter: (val) => {
            if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
            if (val >= 1000) return Math.round(val / 1000) + "K";
            return Math.round(val).toString();
          },
          style: {
            colors: [impressionsColor],
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 500,
          },
        },
      },
      {
        seriesName: "CTR (%)",
        opposite: true,
        title: { text: undefined },
        labels: {
          formatter: (val) =>
            typeof val === "number" ? val.toFixed(1) + "%" : val + "%",
          style: {
            colors: [ctrColor],
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 500,
          },
        },
      },
    ],
    grid: {
      padding: { left: 10, right: 10, top: 10, bottom: 0 },
      strokeDashArray: 4,
      borderColor: isLight ? "rgba(226, 232, 240, 0.8)" : "rgba(255,255,255,0.07)",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    theme: { mode: isLight ? "light" : "dark" },
    tooltip: {
      theme: isLight ? "light" : "dark",
      shared: true,
      intersect: false,
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
