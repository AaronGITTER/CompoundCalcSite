let investmentChart, dividendChart;

function initializeCharts() {
    let ctx1 = document.getElementById('investmentChart').getContext('2d');
    investmentChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Investment Value',
                data: [],
                borderColor: '#0056b3',
                backgroundColor: 'rgba(0, 86, 179, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Years'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    let ctx2 = document.getElementById('dividendChart').getContext('2d');
    dividendChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Dividend Income',
                data: [],
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: '#007bff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Years'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Dividend Income'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function calculateInvestment() {
    // Get input values
    let principal = parseFloat(document.getElementById('principal').value);
    let growthRate = parseFloat(document.getElementById('growthRate').value);
    let dividendRate = parseFloat(document.getElementById('dividendRate').value) || 0;
    let years = parseInt(document.getElementById('years').value);
    let compounds = parseInt(document.getElementById('compounds').value);
    let contribution = parseFloat(document.getElementById('contribution').value);
    let contributionFrequency = document.getElementById('contributionFrequency').value;
    let contributionIncrease = parseFloat(document.getElementById('contributionIncrease').value) / 100;
    let reinvestDividends = document.getElementById('reinvestDividends').checked;

    // Input validation
    if (isNaN(principal) || principal <= 0) {
        alert('Please enter a valid initial investment amount.');
        return;
    }
    if (isNaN(growthRate) || growthRate < 0 || growthRate > 99) {
        alert('Please enter a valid annual capital growth rate between 0% and 99%.');
        return;
    }
    if (isNaN(dividendRate) || dividendRate < 0 || dividendRate > 99) {
        alert('Please enter a valid annual dividend rate between 0% and 99%.');
        return;
    }
    if (isNaN(years) || years <= 0) {
        alert('Please enter a valid number of years.');
        return;
    }
    if (isNaN(contribution) || contribution < 0) {
        alert('Please enter a valid contribution amount.');
        return;
    }
    if (isNaN(contributionIncrease) || contributionIncrease < 0) {
        alert('Please enter a valid yearly contribution increase percentage.');
        return;
    }

    // Convert rates to decimal for calculations
    growthRate /= 100;
    dividendRate /= 100;

    // Clear previous table rows and chart data
    document.getElementById('tableBody').innerHTML = '';
    let chartLabels = [];
    let chartData = [];
    let dividendChartData = [];

    // Determine the number of contribution periods based on the frequency
    let contributionPeriods;
    switch (contributionFrequency) {
        case 'monthly':
            contributionPeriods = 12;
            break;
        case 'weekly':
            contributionPeriods = 52;
            break;
        default:
            contributionPeriods = 1;
            break;
    }

    // Calculate compound interest with contributions and dividends
    let currentBalance = principal;
    let annualContribution = contribution;
    let totalDividends = 0; // Variable to keep track of total dividends
    for (let year = 1; year <= years; year++) {
        let growthEarned = currentBalance * Math.pow((1 + growthRate / compounds), compounds) - currentBalance;
        let dividendsEarned = currentBalance * dividendRate;
        let totalContributions = annualContribution * contributionPeriods;

        // Reinvest dividends if checked
        if (reinvestDividends) {
            currentBalance += dividendsEarned;
        }

        // Update the balance
        currentBalance += growthEarned + totalContributions;

        // Append the row to the table
        let row = `<tr>
            <td>${year}</td>
            <td>${(currentBalance - growthEarned - dividendsEarned - totalContributions).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td>${growthEarned.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td>${dividendsEarned.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td>${totalContributions.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td>${currentBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
        </tr>`;
        document.getElementById('tableBody').innerHTML += row;

        // Update chart data
        chartLabels.push(`Year ${year}`);
        chartData.push(currentBalance);
        dividendChartData.push(dividendsEarned);

        // Accumulate total dividends
        totalDividends += dividendsEarned;

        // Increase annual contribution for next year
        annualContribution *= (1 + contributionIncrease);
    }

    // Calculate and display the future value including contributions and dividends
    document.getElementById('futureValue').textContent = currentBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    // Update the investment value chart
    investmentChart.data.labels = chartLabels;
    investmentChart.data.datasets[0].data = chartData;
    investmentChart.update();

    // Update the dividend income chart
    dividendChart.data.labels = chartLabels;
    dividendChart.data.datasets[0].data = dividendChartData;
    dividendChart.update();
}

// Initialize charts on page load
window.onload = initializeCharts;
