


$(document).ready(function () {
    function update() {
        $.ajax({
            url: '/api/statistics',
            success: (payload) => {
                // console.log(payload)
                // Total Rooms
                document.getElementById('roomCount').innerHTML = payload.totalRooms;
                document.getElementById('roomFix').innerText = (payload.totalRooms == 1) ? '' : 's';
                // Total Online People in all Rooms
                document.getElementById('userCount').innerHTML = payload.totalOnline;
                // Scheduled Rooms Count
                document.getElementById('scheduledCount').innerHTML = payload.totalScheduled;
                document.getElementById('scheduledFix').innerText = (payload.totalScheduled == 1) ? '' : 's';
                // Largest Room Name
                document.getElementById('topRoomName').innerHTML = payload.topRoom.name;
                document.getElementById('topUserFix').innerText = (payload.topRoom.listeners == 1) ? '' : 's';
                // Largest Room Listners
                document.getElementById('topUserCount').innerHTML = payload.topRoom.listeners;
                // Longest Room
                document.getElementById('longestRoom').innerHTML = payload.longestRoom.name;
                document.getElementById('longestUserCount').innerHTML = payload.longestRoom.listeners;
                document.getElementById('longestUserFix').innerText = (payload.longestRoom.listeners == 1) ? '' : 's';
                // Newest Room
                document.getElementById('newestRoom').innerHTML = payload.newestRoom.name;
                document.getElementById('newestUserCount').innerHTML = payload.newestRoom.listeners;
                document.getElementById('newestUserFix').innerText = (payload.newestRoom.listeners == 1) ? '' : 's';

                if (payload.botAccounts.totalBotsOnline == 1) {
                    document.getElementById('botsOnline').innerHTML = payload.botAccounts.totalBotsOnline + ' Bot Online';
                } else if (payload.botAccounts.totalBotsOnline == 0) {
                    document.getElementById('botsOnline').innerHTML = 'No bots online :(';
                } else {
                    document.getElementById('botsOnline').innerHTML = payload.botAccounts.totalBotsOnline + ' Bots Online';
                }


                // Get room status 
                function getStatus(element, payloadCreation) {
                   
                    let currentTime = new Date().valueOf() 
                    // let serverOffset = (1000*60*60*-12)
                    let roomCreation = new Date(payloadCreation).valueOf();
                    // let timeDiff = (currentTime - roomCreation - serverOffset) / (1000 * 60) ; // minutes
                    let timeDiff = (currentTime - roomCreation) / (1000 * 60) ; // minutes

                    // let timeDiffHours = timeDiff / 60
                    // let shortenedText = ~~timeDiffHours;



                    // shortenedText === 24 ? shortenedText = 0 :  console.log(shortenedText)

                    

                    // let minutes = ~~((timeDiffHours - ~~timeDiffHours) * 60)
                    // let days = 0;
                    // if (timeDiffHours > 23) {
                    //     days = ~~(timeDiff / 60 / 24);
                    // }
                    // let hours = shortenedText - days * 24;

                    let days = ~~(timeDiff/60/24)
                    let minutes = ~~(timeDiff%60)
                    let hours = ~~(timeDiff/60%24)

                    
                    
                
                    
                    function changeText(text = 'Generating...') {
    
                        element.innerHTML = "Room Status: " +  text + " (" +  
                        (days === 0 ? "" : "Days: " + days + " | ") + 
                        (hours === 0 ? "" : "Hours: " + hours + " | ")
                         + "Minutes: " + minutes + ")";
    
                        // shortened text is 217

                    }

                    switch (true) {

                        case (timeDiff < 30): {
                            changeText("⛽️ Fueling Rocket")
                            break;
                        }
                        case (timeDiff < 60): {
                            changeText("🚀 Taking Off")
                            break;
                        }
                        case (timeDiff < 240): {
                            changeText("🚀✨ In Space")
                            break;
                        }
                        case (timeDiff < 480): {
                            changeText("🚀🌕 Approaching Moon")
                            break;
                        }
                        case (timeDiff < 1440): {
                            changeText("🌕🐕 Lunar Doge")
                            break;
                        }
                        case (timeDiff < 2880): {
                            changeText("🚀☀️ Approaching Sun")
                            break;
                        }
                        case (timeDiff < 5760): {
                            changeText("☀️🐕 Solar Doge")
                            break;
                        }
                        case (timeDiff < 11520): {
                            changeText("🚀🌌 Approaching Galaxy")
                            break;
                        }
                        case (timeDiff < 23040): {
                            changeText("🌌🐕 Galatic Doge")
                            break;
                        }
                        case (timeDiff < 23041): {
                            changeText("🪐👾 Spotted Life")
                            break;
                        }
                    }

                }
                getStatus(document.getElementById('timeOnline'), payload.topRoom.created_at)
                getStatus(document.getElementById('newestTimeOnline'), payload.newestRoom.created_at)
                getStatus(document.getElementById('longestTimeOnline'), payload.longestRoom.created_at)

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
                    dataset.data.push(payload.totalOnline);
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
// s3ansh33p - nothing sus
