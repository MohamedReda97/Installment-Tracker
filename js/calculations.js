// Calculation Functions

// Main calculation function
function recomputeRowsAndCollectTimeline(billingDate, collectTimeline) {
  const rows = document.querySelectorAll('#installmentsTable tbody tr');
  const totalsByMonth = new Map();
  const detailsByMonth = new Map();
  const merchantsByMonth = new Map();

  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 7) return;

    const merchantInput = cells[0].querySelector('input');
    const enrollmentVal = getDateValue(cells[1]);
    const amountInput = cells[2].querySelector('input');
    const totalInput = cells[3].querySelector('input');
    const firstCell = cells[4];
    const currentCell = cells[5];
    const remainingCell = cells[6];

    firstCell.textContent = '';
    currentCell.textContent = '';
    remainingCell.textContent = '';

    const merchantName = merchantInput ? merchantInput.value.trim() : '';
    const amount = parseFloat(amountInput ? amountInput.value : 0);
    const totalInst = parseInt(totalInput ? totalInput.value : 0, 10);

    if (!enrollmentVal || isNaN(amount) || isNaN(totalInst) || totalInst <= 0) {
      return;
    }

    const enrollDate = new Date(enrollmentVal + 'T00:00:00');
    const day = enrollDate.getDate();

    // First billing month logic
    const firstBillingMonth = new Date(
      enrollDate.getFullYear(),
      enrollDate.getMonth() + (day > 22 ? 1 : 0),
      1
    );

    // First installment date = 1st of month after firstBillingMonth
    const firstInstallDate = addMonthsToDate(firstBillingMonth, 1);
    firstCell.textContent = formatDateDMY(firstInstallDate);

    // Current installment number at billingMonth
    let currentInst = 0;
    let remaining = totalInst;

    if (billingDate >= firstBillingMonth) {
      const diffMonths =
        (billingDate.getFullYear() - firstBillingMonth.getFullYear()) * 12 +
        (billingDate.getMonth() - firstBillingMonth.getMonth());
      currentInst = Math.min(totalInst, diffMonths + 1);
      remaining = Math.max(0, totalInst - currentInst);
    }

    currentCell.textContent = currentInst.toString();
    remainingCell.textContent = remaining.toString();

    if (!collectTimeline || remaining <= 0) return;

    // Add all future payments (>= billingDate) to timeline
    for (let k = 0; k < totalInst; k++) {
      const payDate = addMonthsToDate(firstInstallDate, k);
      if (payDate < billingDate) continue;

      const installmentNo = k + 1;
      const key = payDate.getFullYear() + '-' + String(payDate.getMonth() + 1).padStart(2, '0');

      if (totalsByMonth.has(key)) {
        totalsByMonth.get(key).total += amount;
      } else {
        totalsByMonth.set(key, { date: payDate, total: amount });
      }

      // Store detailed breakdown
      if (!detailsByMonth.has(key)) {
        detailsByMonth.set(key, []);
      }
      detailsByMonth.get(key).push({
        merchant: merchantName || 'N/A',
        installmentNo: installmentNo,
        amount: amount
      });

      // Store by merchant for stacked chart
      if (!merchantsByMonth.has(key)) {
        merchantsByMonth.set(key, new Map());
      }
      const monthMerchants = merchantsByMonth.get(key);
      if (monthMerchants.has(merchantName)) {
        monthMerchants.set(merchantName, monthMerchants.get(merchantName) + amount);
      } else {
        monthMerchants.set(merchantName, amount);
      }
    }
  });

  if (!collectTimeline) return { timeline: [], details: new Map(), merchants: new Map() };

  const sorted = Array.from(totalsByMonth.values()).sort((a, b) => a.date - b.date);
  return { timeline: sorted, details: detailsByMonth, merchants: merchantsByMonth };
}

// Calculate timeline button handler
function calculateTimeline() {
  const billingMonthValue = document.getElementById('billingMonth').value;
  if (!billingMonthValue) {
    alert('Please select the billing month (statement month).');
    return;
  }
  const billingDate = new Date(billingMonthValue + '-01T00:00:00');

  const result = recomputeRowsAndCollectTimeline(billingDate, true);
  const timelinePairs = result.timeline;
  currentTimelineDetails = result.details;
  currentMerchantsByMonth = result.merchants;

  if (timelinePairs.length === 0) {
    alert('No installments found from this billing month onwards.');
    updateChart([], new Map(), []);
    hideMonthDetail();
    return;
  }

  const labels = timelinePairs.map(item => formatMonthLabel(item.date));

  updateChart(labels, currentMerchantsByMonth, timelinePairs);
  hideMonthDetail();
}

