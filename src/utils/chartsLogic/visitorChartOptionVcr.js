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
    dataLabels: { enabled: false },
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
