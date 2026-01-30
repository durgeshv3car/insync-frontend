export const visitorChartOption = (dailyReportsData = []) => {
   const dataArray = Array.isArray(dailyReportsData)
    ? dailyReportsData
    : dailyReportsData?.data || [];   // handles {data: []}

  const sorted = dataArray.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const categories = [];
  const impressionsSeries = [];
  const ctrSeries = [];

  sorted.forEach((item) => {
    const dateLabel = item.date.split("/").slice(1).join("/"); // MM/DD
    categories.push(dateLabel);

    const impressions = Number(item.impressions) || 0;

    // ctr comes like "0.081%"
    const ctr = item.ctr
      ? parseFloat(item.ctr.replace("%", ""))
      : 0;

    impressionsSeries.push(impressions);
    ctrSeries.push(ctr);
  });

  return {
    series: [
      { name: "Impressions", data: impressionsSeries },
      { name: "CTR (%)", data: ctrSeries },
    ],
    chart: { height: 350, type: "area", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#3454D1", "#FFA21D"],
    dataLabels: {
      enabled: true,
      formatter: function (val, { seriesIndex }) {
        if (seriesIndex === 0) { // Impressions
          if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
          if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
          return val;
        }
        return val.toFixed(2) + "%"; // CTR
      },
      offsetY: -5,
      style: {
        fontSize: '10px',
        colors: ["#3454D1", "#FFA21D"]
      },
      background: {
        enabled: true,
        foreColor: '#fff',
        padding: 4,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#fff',
        opacity: 0.9,
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
          colors: "#64748b",
        },
      },
    },
    yaxis: [
      {
        title: { text: "Impressions" },
        labels: {
          formatter: (val) => Math.round(val),
        },
      },
      {
        opposite: true,
        title: { text: "CTR %" },
        labels: {
          formatter: (val) => val + "%",
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
    markers: { size: 3, strokeWidth: 3 },
    grid: {
      padding: { left: 0, right: 0 },
      strokeDashArray: 3,
      borderColor: "#ebebf3",
    },
  };
};
