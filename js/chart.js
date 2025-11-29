// Chart Functions

let timelineChart = null;
let currentTimelineDetails = new Map();
let currentMerchantsByMonth = new Map();

// Generate consistent colors for merchants
const merchantColors = new Map();
const colorPalette = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#06b6d4', '#f43f5e', '#22c55e', '#eab308', '#a855f7'
];
let colorIndex = 0;

function getMerchantColor(merchant) {
  if (!merchantColors.has(merchant)) {
    merchantColors.set(merchant, colorPalette[colorIndex % colorPalette.length]);
    colorIndex++;
  }
  return merchantColors.get(merchant);
}

function updateChart(labels, merchantsByMonth, timelinePairs) {
  const ctx = document.getElementById('timelineChart').getContext('2d');

  // Get all unique merchants
  const allMerchants = new Set();
  merchantsByMonth.forEach(monthData => {
    monthData.forEach((amount, merchant) => {
      allMerchants.add(merchant);
    });
  });

  // Create datasets for each merchant
  const datasets = [];
  allMerchants.forEach(merchant => {
    const data = [];
    timelinePairs.forEach(item => {
      const key = item.date.getFullYear() + '-' + String(item.date.getMonth() + 1).padStart(2, '0');
      const monthData = merchantsByMonth.get(key);
      const amount = monthData && monthData.has(merchant) ? monthData.get(merchant) : 0;
      data.push(Number(amount.toFixed(2)));
    });

    datasets.push({
      label: merchant || 'N/A',
      data: data,
      backgroundColor: getMerchantColor(merchant),
      borderColor: getMerchantColor(merchant),
      borderWidth: 1
    });
  });

  if (timelineChart) {
    timelineChart.data.labels = labels;
    timelineChart.data.datasets = datasets;
    timelineChart.update();
    return;
  }

  timelineChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      onClick: (event, activeElements) => {
        if (activeElements.length > 0) {
          const index = activeElements[0].index;
          const monthLabel = timelineChart.data.labels[index];
          showMonthDetail(monthLabel);
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#e5e7eb',
            padding: 10,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              if (value === 0) return null;
              return label + ': ' + value.toFixed(2);
            },
            footer: function(tooltipItems) {
              let total = 0;
              tooltipItems.forEach(item => {
                total += item.parsed.y;
              });
              return 'Total: ' + total.toFixed(2);
            }
          },
          filter: function(tooltipItem) {
            return tooltipItem.parsed.y !== 0;
          }
        },
        datalabels: {
          display: true,
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 10
          },
          formatter: function(value, context) {
            if (value === 0) return '';
            return value.toFixed(2);
          },
          anchor: 'center',
          align: 'center'
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#e5e7eb' },
          grid: { color: '#374151' }
        },
        y: {
          stacked: true,
          ticks: { color: '#e5e7eb' },
          grid: { color: '#374151' }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function showMonthDetail(monthLabel) {
  const billingMonthValue = document.getElementById('billingMonth').value;
  const billingDate = new Date(billingMonthValue + '-01T00:00:00');

  let matchingKey = null;
  for (const [key, details] of currentTimelineDetails.entries()) {
    const keyDate = new Date(key + '-01T00:00:00');
    const keyLabel = formatMonthLabel(keyDate);
    if (keyLabel === monthLabel) {
      matchingKey = key;
      break;
    }
  }

  if (!matchingKey || !currentTimelineDetails.has(matchingKey)) {
    return;
  }

  const details = currentTimelineDetails.get(matchingKey);
  const tbody = document.querySelector('#monthDetailTable tbody');
  tbody.innerHTML = '';

  let totalAmount = 0;
  details.forEach((item) => {
    const tr = document.createElement('tr');
    const tdMerchant = document.createElement('td');
    const tdInstNo = document.createElement('td');
    const tdAmount = document.createElement('td');

    tdMerchant.textContent = item.merchant;
    tdInstNo.textContent = item.installmentNo;
    tdAmount.textContent = item.amount.toFixed(2);

    tr.appendChild(tdMerchant);
    tr.appendChild(tdInstNo);
    tr.appendChild(tdAmount);
    tbody.appendChild(tr);

    totalAmount += item.amount;
  });

  document.getElementById('monthDetailTotal').textContent = totalAmount.toFixed(2);
  document.getElementById('monthDetailTitle').textContent = `Installments for ${monthLabel}`;
  document.getElementById('monthDetailCard').style.display = 'block';
}

function hideMonthDetail() {
  document.getElementById('monthDetailCard').style.display = 'none';
}


