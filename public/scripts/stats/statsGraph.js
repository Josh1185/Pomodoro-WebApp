let pomodoroChart;

export function createPomodoroChart() {
  const accentColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--accent-color')
  .trim();

  const ctx = document.getElementById('bar-chart').getContext('2d');

  pomodoroChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // example labels
      datasets: [{
        label: 'Pomodoro Minutes',
        data: [30, 45, 60, 50, 40, 20, 0], // example data
        backgroundColor: accentColor,
        borderColor: accentColor,
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Minutes'
          }
        }
      }
    }
  });
}

export function updateChartAccentColor() {
  if (!pomodoroChart) return;

  const newColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-color')
    .trim();

  pomodoroChart.data.datasets[0].backgroundColor = newColor;
  pomodoroChart.data.datasets[0].borderColor = newColor;
  pomodoroChart.update();
}

export async function updateChart(range) {
  console.log(range)
}

/*
const labels = ['April', 'May', 'June'];
const data = [320, 450, 610];

pomodoroChart.data.labels = labels;
pomodoroChart.data.datasets[0].data = data;
pomodoroChart.update();
*/