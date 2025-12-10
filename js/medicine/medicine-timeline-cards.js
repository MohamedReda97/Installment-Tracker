// Medicine Timeline Cards - Card-based visualization
// PHASE 1: Hardcoded test data for UI approval

console.log('📇 Medicine Timeline Cards module loaded');

// Hardcoded test data - 5 cards with various change scenarios
const TEST_TIMELINE_CARDS = [
  {
    // Card 1: 3 medicines, all active (no change indicators - first card)
    dateRange: {
      start: new Date(2025, 11, 1), // Dec 2025
      end: new Date(2026, 1, 28)    // Feb 2026
    },
    medicines: {
      'Morning': [
        { name: 'Vitamin D', dose: '5000 IU', change: null },
        { name: 'Omega-3', dose: '1000mg', change: null }
      ],
      'Lunch': [
        { name: 'Multivitamin', dose: '1 tablet', change: null }
      ]
    }
  },
  {
    // Card 2: 1 medicine paused (Omega-3), 1 new medicine added (Aspirin)
    dateRange: {
      start: new Date(2026, 2, 1),  // Mar 2026
      end: new Date(2026, 3, 30)    // Apr 2026
    },
    medicines: {
      'Morning': [
        { name: 'Vitamin D', dose: '5000 IU', change: null },
        { name: 'Aspirin', dose: '81mg', change: 'new' }
      ],
      'Lunch': [
        { name: 'Multivitamin', dose: '1 tablet', change: null }
      ]
    },
    pausedMedicines: [
      { name: 'Omega-3', dose: '1000mg', time: 'Morning', change: 'paused' }
    ]
  },
  {
    // Card 3: 1 medicine resumed (Omega-3), 1 medicine ended (Multivitamin)
    dateRange: {
      start: new Date(2026, 4, 1),  // May 2026
      end: new Date(2026, 6, 31)    // Jul 2026
    },
    medicines: {
      'Morning': [
        { name: 'Vitamin D', dose: '5000 IU', change: null },
        { name: 'Omega-3', dose: '1000mg', change: 'new' }, // Resumed
        { name: 'Aspirin', dose: '81mg', change: null }
      ]
    },
    endedMedicines: [
      { name: 'Multivitamin', dose: '1 tablet', time: 'Lunch', change: 'ended' }
    ]
  },
  {
    // Card 4: 2 new medicines added (Calcium, Magnesium)
    dateRange: {
      start: new Date(2026, 7, 1),  // Aug 2026
      end: new Date(2026, 9, 31)    // Oct 2026
    },
    medicines: {
      'Morning': [
        { name: 'Vitamin D', dose: '5000 IU', change: null },
        { name: 'Omega-3', dose: '1000mg', change: null },
        { name: 'Aspirin', dose: '81mg', change: null }
      ],
      'Evening': [
        { name: 'Calcium', dose: '500mg', change: 'new' },
        { name: 'Magnesium', dose: '250mg', change: 'new' }
      ]
    }
  },
  {
    // Card 5: 1 medicine paused (Vitamin D), 1 medicine resumed (would show as new if it was paused before)
    dateRange: {
      start: new Date(2026, 10, 1), // Nov 2026
      end: new Date(2026, 11, 31)   // Dec 2026
    },
    medicines: {
      'Morning': [
        { name: 'Omega-3', dose: '1000mg', change: null },
        { name: 'Aspirin', dose: '81mg', change: null }
      ],
      'Evening': [
        { name: 'Calcium', dose: '500mg', change: null },
        { name: 'Magnesium', dose: '250mg', change: 'paused' } // Paused
      ]
    },
    pausedMedicines: [
      { name: 'Vitamin D', dose: '5000 IU', time: 'Morning', change: 'paused' }
    ]
  }
];

// Format date range for card header
function formatCardDateRange(start, end) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const startMonth = months[start.getMonth()];
  const startYear = start.getFullYear();
  const endMonth = months[end.getMonth()];
  const endYear = end.getFullYear();
  
  // Same month and year
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${startYear}`;
  }
  
  // Same year
  if (start.getFullYear() === end.getFullYear()) {
    return `${startMonth} - ${endMonth} ${startYear}`;
  }
  
  // Different years
  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
}

// Render a single timeline card
function renderTimelineCard(cardData) {
  const card = document.createElement('div');
  card.className = 'timeline-card';
  
  // Card header with date range
  const header = document.createElement('div');
  header.className = 'timeline-card-header';
  
  const dateRange = document.createElement('h3');
  dateRange.className = 'timeline-card-date';
  dateRange.textContent = formatCardDateRange(cardData.dateRange.start, cardData.dateRange.end);
  header.appendChild(dateRange);
  
  card.appendChild(header);
  
  // Card body with medicines grouped by time
  const body = document.createElement('div');
  body.className = 'timeline-card-body';

  // Time groups in order
  const timeOrder = ['Morning', 'Breakfast', 'Lunch', 'Dinner', 'Evening'];

  // Render active medicines grouped by time
  timeOrder.forEach(time => {
    if (cardData.medicines[time] && cardData.medicines[time].length > 0) {
      const timeGroup = document.createElement('div');
      timeGroup.className = 'timeline-time-group';

      // Time header
      const timeHeader = document.createElement('div');
      timeHeader.className = 'timeline-time-header';
      timeHeader.textContent = time;
      timeGroup.appendChild(timeHeader);

      // Medicine list
      const medicineList = document.createElement('ul');
      medicineList.className = 'timeline-medicine-list';

      cardData.medicines[time].forEach(medicine => {
        const medicineItem = document.createElement('li');
        medicineItem.className = 'timeline-medicine-item';

        // Medicine info
        const medicineInfo = document.createElement('div');
        medicineInfo.className = 'timeline-medicine-info';

        const medicineName = document.createElement('div');
        medicineName.className = 'timeline-medicine-name';
        medicineName.textContent = medicine.name;
        medicineInfo.appendChild(medicineName);

        const medicineDose = document.createElement('div');
        medicineDose.className = 'timeline-medicine-dose';
        medicineDose.textContent = medicine.dose;
        medicineInfo.appendChild(medicineDose);

        medicineItem.appendChild(medicineInfo);

        // Change badge (if applicable)
        if (medicine.change) {
          const badge = document.createElement('span');
          badge.className = `timeline-change-badge timeline-badge-${medicine.change}`;
          badge.textContent = medicine.change.toUpperCase();
          medicineItem.appendChild(badge);
        }

        medicineList.appendChild(medicineItem);
      });

      timeGroup.appendChild(medicineList);
      body.appendChild(timeGroup);
    }
  });

  // Show paused medicines (if any)
  if (cardData.pausedMedicines && cardData.pausedMedicines.length > 0) {
    const pausedGroup = document.createElement('div');
    pausedGroup.className = 'timeline-time-group';
    pausedGroup.style.opacity = '0.6';

    const pausedHeader = document.createElement('div');
    pausedHeader.className = 'timeline-time-header';
    pausedHeader.style.color = '#6b7280';
    pausedHeader.textContent = 'Paused';
    pausedGroup.appendChild(pausedHeader);

    const pausedList = document.createElement('ul');
    pausedList.className = 'timeline-medicine-list';

    cardData.pausedMedicines.forEach(medicine => {
      const medicineItem = document.createElement('li');
      medicineItem.className = 'timeline-medicine-item';

      const medicineInfo = document.createElement('div');
      medicineInfo.className = 'timeline-medicine-info';

      const medicineName = document.createElement('div');
      medicineName.className = 'timeline-medicine-name';
      medicineName.textContent = `${medicine.name} (${medicine.time})`;
      medicineInfo.appendChild(medicineName);

      const medicineDose = document.createElement('div');
      medicineDose.className = 'timeline-medicine-dose';
      medicineDose.textContent = medicine.dose;
      medicineInfo.appendChild(medicineDose);

      medicineItem.appendChild(medicineInfo);

      const badge = document.createElement('span');
      badge.className = 'timeline-change-badge timeline-badge-paused';
      badge.textContent = 'PAUSED';
      medicineItem.appendChild(badge);

      pausedList.appendChild(medicineItem);
    });

    pausedGroup.appendChild(pausedList);
    body.appendChild(pausedGroup);
  }

  // Show ended medicines (if any)
  if (cardData.endedMedicines && cardData.endedMedicines.length > 0) {
    const endedGroup = document.createElement('div');
    endedGroup.className = 'timeline-time-group';
    endedGroup.style.opacity = '0.6';

    const endedHeader = document.createElement('div');
    endedHeader.className = 'timeline-time-header';
    endedHeader.style.color = '#ef4444';
    endedHeader.textContent = 'Ended';
    endedGroup.appendChild(endedHeader);

    const endedList = document.createElement('ul');
    endedList.className = 'timeline-medicine-list';

    cardData.endedMedicines.forEach(medicine => {
      const medicineItem = document.createElement('li');
      medicineItem.className = 'timeline-medicine-item';

      const medicineInfo = document.createElement('div');
      medicineInfo.className = 'timeline-medicine-info';

      const medicineName = document.createElement('div');
      medicineName.className = 'timeline-medicine-name';
      medicineName.textContent = `${medicine.name} (${medicine.time})`;
      medicineInfo.appendChild(medicineName);

      const medicineDose = document.createElement('div');
      medicineDose.className = 'timeline-medicine-dose';
      medicineDose.textContent = medicine.dose;
      medicineInfo.appendChild(medicineDose);

      medicineItem.appendChild(medicineInfo);

      const badge = document.createElement('span');
      badge.className = 'timeline-change-badge timeline-badge-ended';
      badge.textContent = 'ENDED';
      medicineItem.appendChild(badge);

      endedList.appendChild(medicineItem);
    });

    endedGroup.appendChild(endedList);
    body.appendChild(endedGroup);
  }

  card.appendChild(body);
  return card;
}

// Render all timeline cards
function renderTimelineCards(cardsData = TEST_TIMELINE_CARDS) {
  const container = document.getElementById('medicineTimelineCards');
  if (!container) {
    console.error('❌ Timeline cards container not found');
    return;
  }

  // Clear container
  container.innerHTML = '';

  if (!cardsData || cardsData.length === 0) {
    // Show empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'timeline-empty-state';
    emptyState.innerHTML = `
      <div class="timeline-empty-state-icon">📅</div>
      <div class="timeline-empty-state-text">No timeline data available</div>
      <div class="timeline-empty-state-hint">Add medicines and click "Calculate Timeline" to see your schedule</div>
    `;
    container.appendChild(emptyState);
    return;
  }

  // Render each card
  cardsData.forEach(cardData => {
    const card = renderTimelineCard(cardData);
    container.appendChild(card);
  });

  console.log(`✅ Rendered ${cardsData.length} timeline cards`);
}

// Initialize with test data when Calculate Timeline is clicked
function initializeTimelineCards() {
  console.log('📇 Initializing timeline cards with test data...');
  renderTimelineCards(TEST_TIMELINE_CARDS);
}

