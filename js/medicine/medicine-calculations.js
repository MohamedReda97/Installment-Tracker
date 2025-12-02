// Medicine Calculations - Cycle logic and timeline generation

console.log('🧮 Medicine Calculations module loaded');

// Time order for sorting (Morning first, Evening last)
const TIME_ORDER = {
  'Morning': 1,
  'Breakfast': 2,
  'Lunch': 3,
  'Dinner': 4,
  'Evening': 5
};

// Get the first day of current month
function getCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Add months to a date
function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// Format date as YYYY-MM for keys
function formatMonthKey(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
}

// Format date as "Jan 2024"
function formatMonthDisplay(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[date.getMonth()] + ' ' + date.getFullYear();
}

// Check if a medicine is active in a given month
function isMedicineActiveInMonth(medicine, monthDate) {
  const startDate = new Date(medicine.startDate + 'T00:00:00');
  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  // If month is before start, not active
  if (monthDate < startMonth) {
    return false;
  }

  // Calculate months since start
  const monthsSinceStart =
    (monthDate.getFullYear() - startMonth.getFullYear()) * 12 +
    (monthDate.getMonth() - startMonth.getMonth());

  const duration = parseInt(medicine.duration) || 0;
  const pause = parseInt(medicine.pause) || 0;

  // If no pause, check if within duration
  if (pause === 0) {
    return monthsSinceStart < duration;
  }

  // With pause, calculate cycle position
  const cycleLength = duration + pause;
  const positionInCycle = monthsSinceStart % cycleLength;

  // Active if position is within duration
  return positionInCycle < duration;
}

// Calculate medicine cycles for a specific medicine
function calculateMedicineCycles(medicine, monthsToGenerate = 24) {
  const cycles = [];
  const startDate = new Date(medicine.startDate + 'T00:00:00');
  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const currentMonth = getCurrentMonth();

  const duration = parseInt(medicine.duration) || 0;
  const pause = parseInt(medicine.pause) || 0;

  if (duration === 0) {
    return cycles;
  }

  // Generate cycles for the specified number of months
  for (let i = 0; i < monthsToGenerate; i++) {
    const monthDate = addMonths(currentMonth, i);
    const isActive = isMedicineActiveInMonth(medicine, monthDate);

    cycles.push({
      month: monthDate,
      monthKey: formatMonthKey(monthDate),
      monthDisplay: formatMonthDisplay(monthDate),
      isActive: isActive,
      status: isActive ? 'active' : 'paused'
    });
  }

  return cycles;
}

// Generate timeline data for all medicines
function generateMedicineTimeline(medicines, startMonth = null, monthCount = 12) {
  if (!startMonth) {
    startMonth = getCurrentMonth();
  }

  const timeline = [];

  // Sort medicines by time (Morning first, Evening last)
  const sortedMedicines = [...medicines].sort((a, b) => {
    const orderA = TIME_ORDER[a.time] || 999;
    const orderB = TIME_ORDER[b.time] || 999;
    return orderA - orderB;
  });

  // For each medicine, generate timeline data
  sortedMedicines.forEach(medicine => {
    const medicineTimeline = {
      id: medicine.id,
      name: medicine.name,
      dose: medicine.dose,
      time: medicine.time,
      timeOrder: TIME_ORDER[medicine.time] || 999,
      startDate: medicine.startDate,
      duration: medicine.duration,
      pause: medicine.pause,
      notes: medicine.notes,
      months: []
    };

    // Generate data for each month
    for (let i = 0; i < monthCount; i++) {
      const monthDate = addMonths(startMonth, i);
      const isActive = isMedicineActiveInMonth(medicine, monthDate);

      medicineTimeline.months.push({
        date: monthDate,
        monthKey: formatMonthKey(monthDate),
        monthDisplay: formatMonthDisplay(monthDate),
        isActive: isActive,
        status: isActive ? 'active' : 'paused'
      });
    }

    timeline.push(medicineTimeline);
  });

  return timeline;
}

// Get month details for a specific month
function getMedicineMonthDetails(medicines, monthDate) {
  const details = [];

  // Sort medicines by time
  const sortedMedicines = [...medicines].sort((a, b) => {
    const orderA = TIME_ORDER[a.time] || 999;
    const orderB = TIME_ORDER[b.time] || 999;
    return orderA - orderB;
  });

  sortedMedicines.forEach(medicine => {
    const isActive = isMedicineActiveInMonth(medicine, monthDate);

    details.push({
      id: medicine.id,
      name: medicine.name,
      dose: medicine.dose,
      time: medicine.time,
      status: isActive ? 'Active' : 'Paused',
      isActive: isActive,
      notes: medicine.notes
    });
  });

  return details;
}

// Main calculation function
function calculateMedicineTimeline() {
  console.log('🧮 Calculating medicine timeline...');

  try {
    // Get medicine data
    const medicines = readMedicineTableData();

    if (medicines.length === 0) {
      console.log('⚠️ No medicine data to calculate');
      // Clear chart if exists
      if (typeof clearMedicineChart === 'function') {
        clearMedicineChart();
      }
      return;
    }

    // Generate timeline starting from current month
    const startMonth = getCurrentMonth();
    const timeline = generateMedicineTimeline(medicines, startMonth, 12);

    console.log('✅ Medicine timeline calculated:', timeline);
    console.log('📊 Timeline includes', timeline.length, 'medicines sorted by time');

    // Render the chart (will be implemented in Phase 4)
    if (typeof renderMedicineChart === 'function') {
      renderMedicineChart(timeline, startMonth);
    } else {
      console.log('📊 Chart rendering not yet implemented (Phase 4)');
      console.log('Timeline data ready:', {
        medicineCount: timeline.length,
        monthCount: timeline[0]?.months.length || 0,
        timeGroups: [...new Set(timeline.map(m => m.time))]
      });
    }

  } catch (error) {
    console.error('❌ Error calculating medicine timeline:', error);
  }
}

// Get summary statistics
function getMedicineStatistics(medicines) {
  const stats = {
    total: medicines.length,
    byTime: {},
    active: 0,
    cyclic: 0,
    continuous: 0
  };

  // Count by time
  medicines.forEach(medicine => {
    const time = medicine.time || 'Unknown';
    stats.byTime[time] = (stats.byTime[time] || 0) + 1;

    // Count cyclic vs continuous
    if (medicine.pause > 0) {
      stats.cyclic++;
    } else {
      stats.continuous++;
    }

    // Count currently active
    const currentMonth = getCurrentMonth();
    if (isMedicineActiveInMonth(medicine, currentMonth)) {
      stats.active++;
    }
  });

  return stats;
}
