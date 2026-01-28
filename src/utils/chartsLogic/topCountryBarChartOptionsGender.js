export const topCountryBarChartOptions = (
  dailyReportsData = [],
  activeMetric = "Impressions" // Impressions | CTR | VCR
) => {
  const dataArray = Array.isArray(dailyReportsData)
    ? dailyReportsData
    : [];


  const parseCTR = (ctr) => Number(ctr?.replace("%", "")) || 0;

  const colorMap = {
  Female: "#3454d1",
  Male: "#25b865",
  Unknown: "#ffa21d",
};


  const round = (num, d = 2) =>
    Number(Math.round(num + "e" + d) + "e-" + d);

  const groupMap = {};

  dataArray.forEach((item) => {
    const gender = item.gender || "Unknown";

    const impressions = Number(item.impressions) || 0;

    // derive clicks from API CTR if clicks missing
    const ctrPercent = parseCTR(item.ctr);
    const clicks =
      item.clicks !== undefined
        ? Number(item.clicks)
        : Math.round((ctrPercent / 100) * impressions);

    const completes = Number(item.completeViewsVideo) || 0;

    if (!groupMap[gender]) {
      groupMap[gender] = {
        impressions: 0,
        clicks: 0,
        completes: 0,
      };
    }

    groupMap[gender].impressions += impressions;
    groupMap[gender].clicks += clicks;
    groupMap[gender].completes += completes;
  });

  const categories = Object.keys(groupMap);

  const seriesData = categories.map((gender) => {
    const g = groupMap[gender];

    if (activeMetric === "CTR") {
      const val = g.impressions
        ? (g.clicks / g.impressions) * 100
        : 0;
      return round(val, 2);
    }

    if (activeMetric === "VCR") {
      const val = g.impressions
        ? (g.completes / g.impressions) * 100
        : 0;
      return round(val, 2);
    }

    return g.impressions;
  });

  return {
  chart: {
    type: "bar",
    height: 400,
    toolbar: { show: false },
  },
  series: [
    {
      name: activeMetric,
      data: seriesData,
    },
  ],
 
colors: categories.map((g) => colorMap[g] || "#999"),
plotOptions: {
  bar: {
    columnWidth: "30%",
    borderRadius: 6,
    distributed: true,
  },
},
  plotOptions: {
    bar: {
      columnWidth: "30%",
      borderRadius: 6,
      distributed: true,
    },
  },
  xaxis: {
    categories,
  },

  // ✅ ADD THIS BLOCK
  yaxis: {
    labels: {
      formatter: (val) => {
        if (activeMetric === "Impressions") {
          return Math.round(val);
        }
        return val.toFixed(2);
      },
    },
  },

  tooltip: {
    y: {
      formatter: (val) =>
        activeMetric === "Impressions"
          ? val.toLocaleString()
          : `${val}%`,
    },
  },
};

};
