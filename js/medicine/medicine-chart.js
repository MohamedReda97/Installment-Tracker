// Medicine Chart - Interactive timeline with drag-and-drop

console.log('📊 Medicine Chart module loaded');

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

// Create datasets for the chart
// For horizontal bars with indexAxis='y', we need:
// - labels = medicine names (Y-axis)
// - datasets = one per month, each with data for all medicines
function createMedicineChartDatasets(timeline) {
  const datasets = [];

  // Get all month labels and medicine labels (name only)
  const monthLabels = timeline[0]?.months.map(m => formatChartMonthLabel(m.date)) || [];
  const medicineLabels = timeline.map(m => m.name); // Only medicine name

  console.log('📊 Creating chart datasets...');
  console.log(`   Medicines: ${timeline.length}`);
  console.log(`   Months: ${monthLabels.length}`);

  // Create one dataset per month
  monthLabels.forEach((monthLabel, monthIndex) => {
    // For this month, get data for each medicine
    const data = [];
    const backgroundColor = [];

    timeline.forEach((medicine, medicineIndex) => {
      const monthData = medicine.months[monthIndex];
      const medicineColor = medicineColorPalette[medicineIndex % medicineColorPalette.length];

      if (monthData && monthData.isActive) {
        data.push(1);
        backgroundColor.push(medicineColor);
      } else {
        data.push(null); // null creates gap
        backgroundColor.push('transparent');
      }
    });

    datasets.push({
      label: monthLabel,
      data: data,
      backgroundColor: backgroundColor,
      borderColor: backgroundColor,
      borderWidth: 0,
      borderSkipped: false,
      monthIndex: monthIndex,
      monthLabel: monthLabel
    });
  });

  console.log(`✅ Created ${datasets.length} datasets (one per month)`);

  // Log medicine details
  timeline.forEach((medicine, index) => {
    const activeCount = medicine.months.filter(m => m.isActive).length;
    const pausedCount = medicine.months.filter(m => !m.isActive).length;
    const color = medicineColorPalette[index % medicineColorPalette.length];
    console.log(`   ${medicine.name}: ${activeCount} active, ${pausedCount} paused (color: ${color})`);
  });

  return { datasets, monthLabels, medicineLabels, timeline };
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

// Render the medicine chart
function renderMedicineChart(timeline, startMonth) {
  console.log('📊 Rendering medicine chart...');

  try {
    // Store current timeline
    currentMedicineTimeline = timeline;
    currentStartMonth = startMonth;

    if (timeline.length === 0) {
      console.log('⚠️ No timeline data to render');
      clearMedicineChart();
      return;
    }

    // Create datasets first to get monthLabels and medicineLabels
    const { datasets, monthLabels, medicineLabels, timeline: timelineData } = createMedicineChartDatasets(timeline);

    // Get canvas
    const canvas = document.getElementById('medicineChart');
    if (!canvas) {
      console.error('❌ Medicine chart canvas not found');
      return;
    }

    // Set canvas dimensions for horizontal scrolling
    const medicineHeight = 50; // Height per medicine row
    const calculatedHeight = Math.max(400, timeline.length * medicineHeight + 150);
    const monthWidth = 80; // Width per month column
    const calculatedWidth = Math.max(1200, monthLabels.length * monthWidth);

    canvas.style.height = calculatedHeight + 'px';
    canvas.style.width = calculatedWidth + 'px';

    console.log(`📐 Canvas size: ${calculatedWidth}x${calculatedHeight}px (${monthLabels.length} months × ${timeline.length} medicines)`);

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (medicineChart) {
      medicineChart.destroy();
    }

    // Group medicines by time for separators
    const timeGroups = {};
    timeline.forEach((medicine, index) => {
      if (!timeGroups[medicine.time]) {
        timeGroups[medicine.time] = [];
      }
      timeGroups[medicine.time].push({ medicine, index });
    });

    // Create legend data for medicines
    const medicineLegend = timeline.map((medicine, index) => ({
      name: `${medicine.name} (${medicine.dose}) - ${medicine.time}`,
      color: medicineColorPalette[index % medicineColorPalette.length],
      time: medicine.time
    }));

    // Create new chart
    medicineChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: medicineLabels, // Medicine names on Y-axis (when indexAxis='y')
        datasets: datasets
      },
      options: {
        indexAxis: 'y', // Horizontal bars (medicines on Y-axis, months on X-axis)
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const datasetIndex = activeElements[0].datasetIndex;
            const monthIndex = activeElements[0].index;
            const monthLabel = monthLabels[monthIndex];
            showMedicineMonthDetail(monthLabel, monthIndex);
          }
        },
        plugins: {
          legend: {
            display: false // Hide default legend (we'll show custom legend)
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const medicineIndex = context[0].dataIndex;
                const medicineName = medicineLabels[medicineIndex];
                const datasetIndex = context[0].datasetIndex;
                const monthLabel = monthLabels[datasetIndex];
                return `${medicineName} - ${monthLabel}`;
              },
              label: (context) => {
                const medicineIndex = context.dataIndex;
                const datasetIndex = context.datasetIndex;
                const medicine = timelineData[medicineIndex];
                const monthData = medicine.months[datasetIndex];
                return `Status: ${monthData.status.charAt(0).toUpperCase() + monthData.status.slice(1)}`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true, // Stack months horizontally
            display: true,
            grid: {
              display: false
            },
            ticks: {
              display: false // Hide X-axis ticks (we'll show months in legend)
            },
            title: {
              display: false
            }
          },
          y: {
            stacked: true, // Stack for each medicine row
            display: true,
            grid: {
              display: true,
              color: (context) => {
                // Add separator lines between time groups
                const index = context.index;
                if (index === undefined) return '#374151';

                // Check if this is the last medicine of a time group
                const currentMedicine = timelineData[index];
                const nextMedicine = timelineData[index + 1];

                if (nextMedicine && currentMedicine.time !== nextMedicine.time) {
                  return '#6b7280'; // Thicker line between groups
                }
                return '#374151'; // Normal line
              },
              lineWidth: (context) => {
                const index = context.index;
                if (index === undefined) return 1;

                const currentMedicine = timelineData[index];
                const nextMedicine = timelineData[index + 1];

                if (nextMedicine && currentMedicine.time !== nextMedicine.time) {
                  return 3; // Thicker line between groups
                }
                return 1;
              }
            },
            ticks: {
              color: '#9ca3af',
              font: {
                size: 11
              }
            }
          }
        }
      }
    });

    // Add custom legend showing medicine colors grouped by time
    addCustomLegend(medicineLegend);

    console.log('✅ Medicine chart rendered successfully');
    console.log(`📊 Displaying ${timeline.length} medicines across ${monthLabels.length} months`);

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
