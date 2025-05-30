import { fetchPomodoroSessions } from "./statsFetch.js";
import Chart from '../libs/chart.min.js';

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
  const pomodoroSessions = await fetchPomodoroSessions();
  if (!pomodoroSessions) return;

  let dataToUse = [];

  // Find appropriate array of data based on range selected
  switch (range) {
    case 'daily':
      dataToUse = pomodoroSessions.daily;
      break;
    case 'weekly':
      dataToUse = pomodoroSessions.weekly;
      break;
    case 'monthly':
      dataToUse = pomodoroSessions.monthly;
      break;
  }

  // Generate labels and data for bar graph
  let labels = [];
  let data = [];

  if (range === 'daily') {
    labels = dataToUse.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' }); // 'Mon', 'Tue'
    });

    data = dataToUse.map(item => Number(item.minutes));
  }

  else if (range === 'weekly') {
    labels = dataToUse.map(item => {
      const date = new Date(item.week_start);
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`; // week of 5/12
    });

    data = dataToUse.map(item => Number(item.minutes));
  }

  else if (range === 'monthly') {
    labels = dataToUse.map(item => {
      const [year, month] = item.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); // May 2025
    });

    data = dataToUse.map(item => Number(item.minutes));
  }

  // Update the chartjs instance
  pomodoroChart.data.labels = labels;
  pomodoroChart.data.datasets[0].data = data;
  pomodoroChart.update();
}