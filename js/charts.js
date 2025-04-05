class SebdermCharts {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#D5E3E8',
            secondary: '#F5E6E8',
            accent: '#4A4A4A'
        };
    }

    createSkinTrendChart(data) {
        const ctx = document.getElementById('skinTrendChart').getContext('2d');
        this.charts.skinTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dates,
                datasets: [
                    {
                        label: 'Zona T',
                        data: data.zonaT,
                        borderColor: '#e74c3c',
                        fill: false
                    },
                    {
                        label: 'Guance',
                        data: data.guance,
                        borderColor: '#3498db',
                        fill: false
                    },
                    {
                        label: 'Cuoio Capelluto',
                        data: data.cuoio,
                        borderColor: '#2ecc71',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    createCorrelationChart(correlations) {
        const ctx = document.getElementById('correlationChart').getContext('2d');
        this.charts.correlation = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(correlations),
                datasets: [{
                    label: 'Correlazione con condizione pelle',
                    data: Object.values(correlations),
                    backgroundColor: this.colors.primary
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1
                    }
                }
            }
        });
    }

    createHeatmapChart(data) {
        const ctx = document.getElementById('heatmapChart').getContext('2d');
        this.charts.heatmap = new Chart(ctx, {
            type: 'heatmap',
            data: {
                datasets: [{
                    data: data,
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    updateCharts(newData) {
        // Metodo per aggiornare i grafici con nuovi dati
        Object.values(this.charts).forEach(chart => {
            chart.update();
        });
    }
}