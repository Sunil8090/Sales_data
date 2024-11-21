const fs = require("fs");

fs.readFile("./sales-data.csv", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const rows = data
    .trim()
    .split("\n")
    .map((row) => row.split(","));

  let cleanedRows = rows.map((row) => row.map((cell) => cell.trim()));
  let totalSales = calculateTotalSales(cleanedRows);
  console.log(cleanedRows)
  console.log(calculateMonthWiseSales(cleanedRows));
  console.log(calculateMostPopularItems(cleanedRows));
  console.log(calculateTopRevenueItems(cleanedRows));
  console.log(calculatePopularItemStats(cleanedRows));
});

//all the functionality

function calculateTotalSales(salesData) {
  const totalSales = salesData.reduce((total, sale) => {
    return total + parseFloat(sale[4]);
  }, 0);

  return totalSales;
}

function calculateMonthWiseSales(salesData) {
  if (!Array.isArray(salesData)) {
    throw new Error("Input must be an array of sales data");
  }

  const monthSales = {};

  salesData.forEach((sale) => {
    const month = sale[0].slice(0, 7);
    const totalPrice = parseFloat(sale[4]);

    monthSales[month] = (monthSales[month] || 0) + totalPrice;
  });

  return monthSales;
}

function calculateMostPopularItems(data) {
  const monthlySales = {};

  data.forEach((row) => {
    const date = new Date(row[0]);
    if (isNaN(date)) return;
    const item = row[1];
    const quantity = parseInt(row[3], 10);

    if (!quantity) return;

    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (!monthlySales[month]) {
      monthlySales[month] = {};
    }

    if (!monthlySales[month][item]) {
      monthlySales[month][item] = 0;
    }
    monthlySales[month][item] += quantity;
  });

  const mostPopularItems = Object.entries(monthlySales).map(
    ([month, items]) => {
      const mostPopularItem = Object.entries(items).reduce(
        (max, [item, qty]) =>
          qty > max.quantity ? { item, quantity: qty } : max,
        { item: null, quantity: 0 }
      );
      return { month, ...mostPopularItem };
    }
  );

  return mostPopularItems;
}

function calculateTopRevenueItems(data) {
  const monthlyRevenue = {};

  data.forEach((row) => {
    const date = new Date(row[0]);
    if (isNaN(date)) return;
    const item = row[1];
    const price = parseFloat(row[2]);
    const quantity = parseInt(row[3], 10);

    if (!quantity || !price) return;

    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (!monthlyRevenue[month]) {
      monthlyRevenue[month] = {};
    }

    if (!monthlyRevenue[month][item]) {
      monthlyRevenue[month][item] = 0;
    }
    monthlyRevenue[month][item] += price * quantity;
  });

  const topRevenueItems = Object.entries(monthlyRevenue).map(
    ([month, items]) => {
      const topItem = Object.entries(items).reduce(
        (max, [item, revenue]) =>
          revenue > max.revenue ? { item, revenue } : max,
        { item: null, revenue: 0 }
      );
      return { month, item: topItem.item, revenue: topItem.revenue };
    }
  );

  return topRevenueItems;
}

function calculatePopularItemStats(data) {
  const monthlyData = {};


  data.forEach((row) => {
    const date = new Date(row[0]);
    if (isNaN(date)) return;
    const item = row[1];
    const quantity = parseInt(row[3], 10);

    if (!quantity) return;

    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;


    if (!monthlyData[month]) {
      monthlyData[month] = {};
    }

    if (!monthlyData[month][item]) {
      monthlyData[month][item] = [];
    }
    monthlyData[month][item].push(quantity);
  });


  const popularItemStats = Object.entries(monthlyData).map(([month, items]) => {

    const totalQuantities = Object.entries(items).map(([item, quantities]) => ({
      item,
      total: quantities.reduce((sum, q) => sum + q, 0),
      quantities,
    }));


    const popularItem = totalQuantities.reduce(
      (max, current) => (current.total > max.total ? current : max),
      { item: null, total: 0, quantities: [] }
    );

    const quantities = popularItem.quantities;
    const min = Math.min(...quantities);
    const max = Math.max(...quantities);
    const avg = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;

    return {
      month,
      item: popularItem.item,
      minOrders: min,
      maxOrders: max,
      avgOrders: avg.toFixed(2),
    };
  });

  return popularItemStats;
}
