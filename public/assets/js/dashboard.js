document.addEventListener("DOMContentLoaded", function () {
  const revenueTimeRange = document.getElementById("revenueTimeRange");
  const productTimeRange = document.getElementById("productTimeRange");
  const revenueChartCtx = document.getElementById("revenueChart").getContext("2d");
  const productChartCtx = document.getElementById("productChart").getContext("2d");

  let revenueChart;
  let productChart;

  const fetchRevenueData = (timeRange) => {
    fetch(`/dashboard/revenue?timeRange=${timeRange}`)
      .then(response => response.json())
      .then(data => {
        if (revenueChart) {
          revenueChart.destroy();
        }
        revenueChart = new Chart(revenueChartCtx, {
          type: 'line',
          data: {
            labels: data.labels,
            datasets: [{
              label: 'Revenue',
              data: data.values,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Time'
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Revenue'
                }
              }
            }
          }
        });
      });
  };

  const fetchProductData = (timeRange) => {
    fetch(`/dashboard/top-products?timeRange=${timeRange}`)
      .then(response => response.json())
      .then(data => {
        if (productChart) {
          productChart.destroy();
        }
        productChart = new Chart(productChartCtx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [{
              label: 'Revenue',
              data: data.values,
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Product'
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Revenue'
                }
              }
            }
          }
        });
      });
  };

  revenueTimeRange.addEventListener("change", function () {
    fetchRevenueData(this.value);
  });

  productTimeRange.addEventListener("change", function () {
    fetchProductData(this.value);
  });

  // Initial fetch
  fetchRevenueData(revenueTimeRange.value);
  fetchProductData(productTimeRange.value);
});