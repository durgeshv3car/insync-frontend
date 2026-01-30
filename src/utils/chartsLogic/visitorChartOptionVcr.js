export const visitorChartOption = (dailyReportsData = []) => {
  // Sort by date
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
    const dateLabel = item.date.split("/").slice(1).join("/"); // MM/DD
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
        return val.toFixed(2) + "%"; // VCR
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
        title: { text: "VCR %" },
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
