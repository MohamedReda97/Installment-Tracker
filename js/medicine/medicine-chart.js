// Medicine Chart - ApexCharts Timeline Implementation

console.log('📊 Medicine Chart module loaded (ApexCharts)');

let medicineChart = null;
let currentMedicineTimeline = null;
let currentStartMonth = null;

// Color palette for medicines (each medicine gets a unique color)
const medicineColorPalette = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
];

// Time groups for visual separators
const TIME_GROUPS = ['Morning', 'Breakfast', 'Lunch', 'Dinner', 'Evening'];

// Clear the medicine chart
function clearMedicineChart() {
  if (medicineChart) {
    medicineChart.destroy();
    medicineChart = null;
  }
  currentMedicineTimeline = null;
  currentStartMonth = null;

  // Clear month detail
  const detailSection = document.getElementById('medicineMonthDetail');
  if (detailSection) {
    detailSection.style.display = 'none';
  }

  // Clear custom legend
  const legendContainer = document.getElementById('medicineChartLegend');
  if (legendContainer) {
    legendContainer.remove();
  }

  console.log('📊 Medicine chart cleared');
}

// Format month label for display
function formatChartMonthLabel(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[date.getMonth()] + ' ' + date.getFullYear();
}

// Convert timeline data to ApexCharts rangeBar format
// Each medicine will have multiple date ranges (active periods with gaps for pauses)
function createApexChartData(timeline) {
  const series = [];

  console.log('📊 Creating ApexCharts data...');
  console.log(`   Medicines: ${timeline.length}`);

  timeline.forEach((medicine, medicineIndex) => {
    const medicineColor = medicineColorPalette[medicineIndex % medicineColorPalette.length];
    const ranges = [];

    // Find continuous active periods
    let rangeStart = null;
    let rangeEnd = null;

    medicine.months.forEach((monthData, monthIndex) => {
      if (monthData.isActive) {
        if (rangeStart === null) {
          // Start new range
          rangeStart = monthData.date;
        }
        rangeEnd = monthData.date;

        // If this is the last month, close the range
        if (monthIndex === medicine.months.length - 1) {
          // Add one month to end date to show full month
          const endDate = new Date(rangeEnd);
          endDate.setMonth(endDate.getMonth() + 1);

          ranges.push({
            x: medicine.name, // Y-axis label (medicine name only)
            y: [rangeStart.getTime(), endDate.getTime()],
            fillColor: medicineColor
          });
        }
      } else {
        // Paused month - close current range if exists
        if (rangeStart !== null && rangeEnd !== null) {
          // Add one month to end date to show full month
          const endDate = new Date(rangeEnd);
          endDate.setMonth(endDate.getMonth() + 1);

          ranges.push({
            x: medicine.name,
            y: [rangeStart.getTime(), endDate.getTime()],
            fillColor: medicineColor
          });

          rangeStart = null;
          rangeEnd = null;
        }
      }
    });

    // Add series for this medicine
    series.push({
      name: `${medicine.name} (${medicine.dose}) - ${medicine.time}`,
      data: ranges
    });

    console.log(`   ${medicine.name}: ${ranges.length} active periods`);
  });

  console.log(`✅ Created ${series.length} series`);
  return series;
}

// Show month detail when clicking on a bar
function showMedicineMonthDetail(monthLabel, monthIndex) {
  if (!currentMedicineTimeline) return;

  const detailSection = document.getElementById('medicineMonthDetail');
  const detailTitle = document.getElementById('medicineMonthDetailTitle');
  const detailTableBody = document.querySelector('#medicineMonthDetailTable tbody');

  if (!detailSection || !detailTitle || !detailTableBody) return;

  // Get the month date
  const monthDate = currentMedicineTimeline[0]?.months[monthIndex]?.date;
  if (!monthDate) return;

  // Update title
  detailTitle.textContent = `Medicines for ${monthLabel}`;

  // Clear table
  detailTableBody.innerHTML = '';

  // Add rows for each medicine
  currentMedicineTimeline.forEach(medicine => {
    const monthData = medicine.months[monthIndex];
    if (!monthData) return;

    const tr = document.createElement('tr');

    // Time
    const tdTime = document.createElement('td');
    tdTime.textContent = medicine.time;
    tr.appendChild(tdTime);

    // Name
    const tdName = document.createElement('td');
    tdName.textContent = medicine.name;
    tr.appendChild(tdName);

    // Dose
    const tdDose = document.createElement('td');
    tdDose.textContent = medicine.dose;
    tr.appendChild(tdDose);

    // Status
    const tdStatus = document.createElement('td');
    const statusSpan = document.createElement('span');
    statusSpan.className = monthData.isActive ? 'medicine-status-active' : 'medicine-status-paused';
    statusSpan.textContent = monthData.status.charAt(0).toUpperCase() + monthData.status.slice(1);
    tdStatus.appendChild(statusSpan);
    tr.appendChild(tdStatus);

    // Notes
    const tdNotes = document.createElement('td');
    tdNotes.textContent = medicine.notes || '-';
    tr.appendChild(tdNotes);

    detailTableBody.appendChild(tr);
  });

  // Show detail section
  detailSection.style.display = 'block';

  // Scroll to detail section
  detailSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Hide month detail
function hideMedicineMonthDetail() {
  const detailSection = document.getElementById('medicineMonthDetail');
  if (detailSection) {
    detailSection.style.display = 'none';
  }
}

// Render the medicine chart using ApexCharts
function renderMedicineChart(timeline, startMonth) {
  console.log('📊 Rendering medicine chart with ApexCharts...');

  try {
    // Store current timeline
    currentMedicineTimeline = timeline;
    currentStartMonth = startMonth;

    if (timeline.length === 0) {
      console.log('⚠️ No timeline data to render');
      clearMedicineChart();
      return;
    }

    // Get chart container
    const chartContainer = document.getElementById('medicineChart');
    if (!chartContainer) {
      console.error('❌ Medicine chart container not found');
      return;
    }

    // Destroy existing chart
    if (medicineChart) {
      medicineChart.destroy();
      medicineChart = null;
    }

    // Clear container
    chartContainer.innerHTML = '';

    // Create ApexCharts data
    const series = createApexChartData(timeline);

    // Create legend data for medicines
    const medicineLegend = timeline.map((medicine, index) => ({
      name: `${medicine.name} (${medicine.dose}) - ${medicine.time}`,
      color: medicineColorPalette[index % medicineColorPalette.length],
      time: medicine.time
    }));

    // Group medicines by time for Y-axis grouping
    const timeGroups = {};
    timeline.forEach((medicine, index) => {
      if (!timeGroups[medicine.time]) {
        timeGroups[medicine.time] = [];
      }
      timeGroups[medicine.time].push(medicine.name);
    });

    // ApexCharts options
    const options = {
      series: series,
      chart: {
        type: 'rangeBar',
        height: Math.max(400, timeline.length * 60 + 100),
        toolbar: {
          show: false
        },
        background: 'transparent',
        events: {
          dataPointSelection: (event, chartContext, config) => {
            // Handle click on bar to show details
            const seriesIndex = config.seriesIndex;
            const dataPointIndex = config.dataPointIndex;
            const medicine = timeline[seriesIndex];

            // Find which month was clicked based on the date range
            const clickedRange = series[seriesIndex].data[dataPointIndex];
            const clickedDate = new Date(clickedRange.y[0]);

            // Find the month index
            const monthIndex = medicine.months.findIndex(m => {
              const monthDate = new Date(m.date);
              return monthDate.getFullYear() === clickedDate.getFullYear() &&
                     monthDate.getMonth() === clickedDate.getMonth();
            });

            if (monthIndex >= 0) {
              const monthLabel = formatChartMonthLabel(medicine.months[monthIndex].date);
              showMedicineMonthDetail(monthLabel, monthIndex);
            }
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '70%',
          rangeBarGroupRows: false
        }
      },
      colors: medicineColorPalette,
      fill: {
        type: 'solid',
        opacity: 1
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '11px'
          },
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MMM yyyy',
            day: 'dd MMM',
            hour: 'HH:mm'
          }
        },
        axisBorder: {
          show: true,
          color: '#374151'
        },
        axisTicks: {
          show: true,
          color: '#374151'
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#9ca3af',
            fontSize: '11px'
          }
        }
      },
      grid: {
        borderColor: '#374151',
        strokeDashArray: 0,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      tooltip: {
        theme: 'dark',
        custom: function({ series, seriesIndex, dataPointIndex, w }) {
          const medicine = timeline[seriesIndex];
          const range = w.config.series[seriesIndex].data[dataPointIndex];
          const startDate = new Date(range.y[0]);
          const endDate = new Date(range.y[1]);

          return `
            <div style="padding: 10px; background: #1f2937; border: 1px solid #374151;">
              <div style="color: #f9fafb; font-weight: 600; margin-bottom: 5px;">
                ${medicine.name}
              </div>
              <div style="color: #9ca3af; font-size: 12px;">
                ${medicine.dose} - ${medicine.time}
              </div>
              <div style="color: #9ca3af; font-size: 12px; margin-top: 5px;">
                ${formatChartMonthLabel(startDate)} - ${formatChartMonthLabel(endDate)}
              </div>
            </div>
          `;
        }
      },
      legend: {
        show: false // We'll use custom legend
      },
      theme: {
        mode: 'dark'
      }
    };

    // Create chart
    medicineChart = new ApexCharts(chartContainer, options);
    medicineChart.render();

    // Add custom legend showing medicine colors grouped by time
    addCustomLegend(medicineLegend);

    console.log('✅ Medicine chart rendered successfully with ApexCharts');
    console.log(`📊 Displaying ${timeline.length} medicines`);

  } catch (error) {
    console.error('❌ Error rendering medicine chart:', error);
  }
}


// Add custom legend showing medicine colors grouped by time
function addCustomLegend(medicineLegend) {
  // Find chart container
  const chartContainer = document.querySelector('.chart-scroll-container');
  if (!chartContainer) return;

  // Remove existing legend
  let legendContainer = document.getElementById('medicineChartLegend');
  if (legendContainer) {
    legendContainer.remove();
  }

  // Group medicines by time
  const groupedByTime = {};
  medicineLegend.forEach(item => {
    if (!groupedByTime[item.time]) {
      groupedByTime[item.time] = [];
    }
    groupedByTime[item.time].push(item);
  });

  // Create new legend
  legendContainer = document.createElement('div');
  legendContainer.id = 'medicineChartLegend';
  legendContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    padding: 1rem 0;
    margin-bottom: 1rem;
    border-bottom: 1px solid #374151;
  `;

  // Add each time group
  const timeOrder = ['Morning', 'Breakfast', 'Lunch', 'Dinner', 'Evening'];
  timeOrder.forEach(time => {
    if (!groupedByTime[time]) return;

    const timeGroup = document.createElement('div');
    timeGroup.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    `;

    // Time label
    const timeLabel = document.createElement('div');
    timeLabel.textContent = time;
    timeLabel.style.cssText = `
      color: #f9fafb;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    `;
    timeGroup.appendChild(timeLabel);

    // Medicines in this time group
    groupedByTime[time].forEach(item => {
      const legendItem = document.createElement('div');
      legendItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-left: 0.5rem;
      `;

      const colorBox = document.createElement('div');
      colorBox.style.cssText = `
        width: 16px;
        height: 16px;
        background: ${item.color};
        border-radius: 3px;
      `;

      const label = document.createElement('span');
      label.textContent = item.name;
      label.style.cssText = `
        color: #9ca3af;
        font-size: 0.85rem;
      `;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      timeGroup.appendChild(legendItem);
    });

    legendContainer.appendChild(timeGroup);
  });

  // Insert before chart
  chartContainer.parentNode.insertBefore(legendContainer, chartContainer);
}

// Placeholder functions for Phase 5 (drag-and-drop)
function applyMedicineChartChanges() {
  console.log('applyMedicineChartChanges called - to be implemented in Phase 5');
}

function revertMedicineChartChanges() {
  console.log('revertMedicineChartChanges called - to be implemented in Phase 5');
}
