$(document).ready(function () {
    // Chart Setup

    var labels = [];
    var config = {
        type: 'line',
        data: {
            
            labels: labels,
            datasets: [{
                label: 'Bots',
                backgroundColor: 'rgba(244, 5, 95, 0.55)',
                borderColor: '#f4055f',
                data: [],
                fill: true,
                lineTension: 0,
            }]
        },
        options: {
            responsive: true,
            bezierCurve: false,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            elements: {
                point: {
                    radius: 0
                }
            },
            animation: {
                duration: 0  
            },
            legend: {
                display: false
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            tooltips: {
                callbacks: {
                   title: function(t, d) {
                      return "Time: "+d.labels[t[0].index]+" seconds";
                   }
                }
             },
             
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Seconds',
                        fontColor: '#cacaca'
                    },
                    ticks: {
                        fontColor: '#cacaca'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Online Bots',
                        fontColor: '#cacaca'
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 20,
                        fontColor: '#cacaca'
                    }
                }]
            }
        }
    };

        var ctx = document.getElementById('botsChart').getContext('2d');
        window.chart = new Chart(ctx, config);

        // Rooms
        var labelsRooms = [];
    var config = {
        type: 'line',
        data: {
            labels: labelsRooms,
            datasets: [{
                label: 'Rooms',
                backgroundColor: 'rgba(244, 5, 95, 0.55)',
                borderColor: '#f4055f',
                data: [],
                fill: true,
                lineTension: 0,
            }]
        },
        options: {
            responsive: true,
            bezierCurve: false,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            elements: {
                point: {
                    radius: 0
                }
            },
            animation: {
                duration: 0  
            },
            legend: {
                display: false
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            tooltips: {
                callbacks: {
                   title: function(t, d) {
                      return "Time: "+d.labels[t[0].index]+" seconds";
                   }
                }
             },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Seconds',
                        fontColor: '#cacaca'
                    },
                    ticks: {
                        fontColor: '#cacaca'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Public Rooms',
                        fontColor: '#cacaca'
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 10,
                        fontColor: '#cacaca'
                    }
                }]
            }
        }
    };

        var ctxRooms = document.getElementById('roomBotsChart').getContext('2d');
        window.chartRooms = new Chart(ctxRooms, config);



    function update() {
        $.ajax({
            url: '/api/statistics',
            success: (payload) => {
                console.log(payload)
                if (payload.totalBots == 1) {
                    document.getElementById('botsOnline').innerHTML = payload.totalBots + ' Bot Online';
                } else if (payload.totalBots == 0) {
                    document.getElementById('botsOnline').innerHTML = 'No bots online :(';
                } else {
                    document.getElementById('botsOnline').innerHTML = payload.totalBots + ' Bots Online';
                }
                    // Set start date for client
                    if (window.chartConfig == undefined) {
                    window.chartConfig = {
                        'start' : new Date().valueOf(),
                        'step' : 0,
                        'limit' : 100
                    }
                };

                // User Acitivty Chart
                var time = window.chartConfig.step * 5;
                window.chart.config.data.labels.push(time);
                window.chartConfig.step++;
                window.chart.config.data.datasets.forEach(function (dataset) {
                    dataset.data.push(payload.totalBots);
                });
                // Check if datapoints need to be removed
                // if (window.chart.data.datasets[0].data.length > 20) {
                //     // window.chart.data.datasets[0].data = window.chart.data.datasets[0].data.slice(1);
                //     // window.chart.data.labels = window.chart.data.labels.slice(1);
                // }
                    // window.chart.options.scales.xAxes[0].scaleLabel.labelString = "Minutes"
                    // window.chartRooms.options.scales.xAxes[0].scaleLabel.labelString = "Minutes"
                    if (window.chart.data.datasets[0].data.length >= window.chartConfig.limit) {
                        window.chart.data.datasets[0].data = window.chart.data.datasets[0].data.slice(1);
                        window.chart.data.labels = window.chart.data.labels.slice(1);
                        window.chartRooms.data.datasets[0].data = window.chartRooms.data.datasets[0].data.slice(1);
                        window.chartRooms.data.labels = window.chartRooms.data.labels.slice(1);
                    }

                // Room Acitivty Chart
                window.chartRooms.config.data.labels.push(time);

                window.chartRooms.config.data.datasets.forEach(function (dataset) {
                    dataset.data.push(payload.totalRooms);
                });
                window.chart.update();
                window.chartRooms.update();

            }
        });
    }

    update();
    setInterval(update, 5000);
});