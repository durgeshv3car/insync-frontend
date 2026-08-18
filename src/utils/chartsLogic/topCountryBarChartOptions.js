export const topCountryBarChartOptions = (dailyReportsData = []) => {
  const dataArray = Array.isArray(dailyReportsData)
    ? dailyReportsData
    : [];

  const deviceMap = {};

  dataArray.forEach((item) => {
    const device = item.deviceType || "Unknown";
    const impressions = Number(item.impressions) || 0;

    if (!deviceMap[device]) {
      deviceMap[device] = 0;
    }

    deviceMap[device] += impressions;
  });

  const categories = Object.keys(deviceMap);
  const seriesData = Object.values(deviceMap);

  return {
    chart: {
      type: "bar",
      height: 400,
      fontFamily: "inherit",
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode: "dark" },
    legend: { show: false },
    series: [{ name: "Impressions", data: seriesData }],
    colors: ["#3454d1", "#ffa21d", "#ea4d4d", "#25b865"],
    grid: {
      strokeDashArray: 4,
      position: "back",
      borderColor: "rgba(255,255,255,0.10)",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    plotOptions: {
      bar: {
        columnWidth: "25%",
        borderRadius: 6,
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -30,
      style: {
        fontSize: '12px',
        colors: ["#94a3b8"],
      },
      formatter: function (val) {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val;
      }
    },
    xaxis: {
      categories,
      axisTicks: { show: true },
      axisBorder: { show: false },
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "inherit",
        },
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: { colors: ["#94a3b8"] },
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val) => val,
      },
    },
  };
};
