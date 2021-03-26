function dropdownUpdate(value, element) {
    document.getElementById(element.parentElement.getAttribute('aria-labelledby')).innerText = value;
    changeDataset(((element.parentElement.getAttribute('aria-labelledby') == 'userActivityChartTimeframe') ? 'statsChart' : 'roomsChart'), value)
}

function changeDataset(canvasID, value) {
    console.log(`Canvas ${canvasID} | value ${value}`)
}

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
                document.getElementById('botsProvidingTelem').innerText = payload.totalBotsSendingTelemetry + ' bots providing telemetry'

                if (payload.totalBotsOnline == 1) {
                    document.getElementById('botsOnline').innerHTML = payload.totalBotsOnline + ' Bot Online';
                } else if (payload.totalBotsOnline == 0) {
                    document.getElementById('botsOnline').innerHTML = 'No bots online :(';
                } else {
                    document.getElementById('botsOnline').innerHTML = payload.totalBotsOnline + ' Bots Online';
                }


                // Get room status 
                function getStatus(element, payloadCreation) {

                    let currentTime = new Date().valueOf()
                    // let serverOffset = (1000*60*60*-12)
                    let roomCreation = new Date(payloadCreation).valueOf();
                    // let timeDiff = (currentTime - roomCreation - serverOffset) / (1000 * 60) ; // minutes
                    let timeDiff = (currentTime - roomCreation) / (1000 * 60); // minutes

                    // let timeDiffHours = timeDiff / 60
                    // let shortenedText = ~~timeDiffHours;



                    // shortenedText === 24 ? shortenedText = 0 :  console.log(shortenedText)



                    // let minutes = ~~((timeDiffHours - ~~timeDiffHours) * 60)
                    // let days = 0;
                    // if (timeDiffHours > 23) {
                    //     days = ~~(timeDiff / 60 / 24);
                    // }
                    // let hours = shortenedText - days * 24;

                    let days = ~~(timeDiff / 60 / 24)
                    let minutes = ~~(timeDiff % 60)
                    let hours = ~~(timeDiff / 60 % 24)





                    function changeText(text = 'Generating...') {

                        element.innerHTML = "Room Status: " + text + " (" + (days === 0 ? "" : "Days: " + days + " | ") + "Hours: " + hours + " | Minutes: " + minutes + ")";

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
                        'start': new Date().valueOf(),
                        'step': 0,
                        'limit': 100
                    }
                    window.chartData = {
                        'datasets': [0, 1, 2]
                    };
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
        $.ajax({
            url: '/api/bots',
            success: (payload) => {
                // console.log(payload)
                let uniqueBots = [];
                for (let i = 0; i < payload.bots.length; i++) {
                    if (payload.bots[i].bot != undefined) {
                        uniqueBots.push(payload.bots[i]);
                    }
                }
                // console.log(uniqueBots)
                if (document.getElementsByClassName("uuid").length > uniqueBots.length) {
                    // Remove all for now
                    document.getElementById('testBots').innerHTML = "";
                }
                for (i = 0; i < uniqueBots.length; i++) {
                    var botExists = false;
                    if (document.getElementById("testBots").innerText.indexOf(uniqueBots[i].bot.uuid) == -1) {
                        document.getElementById('testBots').innerHTML +=
                            `<a target="_blank"${(uniqueBots[i].room.uuid == null) ? '' : ' href="https://dogehouse.tv/room/' + uniqueBots[i].room.uuid + '"'}>
                        <div class="card accounts-card">
                            <div class="card-body border-r">
                                <div class="con-grid1">
                                    <img class="account-avatar" src="https://avatars.githubusercontent.com/u/80551136?s=280&v=4">
                                    <div class="account-text" style="line-height: 15px; text-align: left;">
                                    ${uniqueBots[i].bot.username}<br>
                                        <span class="uuid" style="font-size: 10px; --tw-text-opacity: 1; color: rgba(154.148,165.363,177.352,var(--tw-text-opacity));">${uniqueBots[i].bot.uuid}</span>
                                        <i style="font-size: 1rem; display: block;">${(uniqueBots[i].room.name == null) ? "" : uniqueBots[i].room.name}</i>

                                        </div>

                                    <div class="right-col-rooms">
                                      <i class="fas fa-user-friends" aria-hidden="true"></i> ${(uniqueBots[i].room.listening == null) ? 0 : uniqueBots[i].room.listening}
                                    </div>
                                </div>
                                <br><br>
                            </div>
                        </div>
                    </a><br>`
                    }
                    for (let j = 0; j < uniqueBots.length; j++) {
                        if (document.getElementsByClassName("uuid")[j] != undefined) {
                            if (uniqueBots[i].bot.uuid == document.getElementsByClassName("uuid")[j].innerText) {
                                botExists = true;
                                document.getElementsByClassName("uuid")[j].parentElement.parentElement.children[2].innerHTML = `<i class="fas fa-user-friends" aria-hidden="true"></i> ` + ((uniqueBots[i].room.listening == null) ? 0 : uniqueBots[i].room.listening);
                                document.getElementsByClassName("uuid")[j].parentElement.children[2].innerText = (uniqueBots[i].room.name == null) ? "" : uniqueBots[i].room.name;
                            }
                        }
                    }
                    if (i == (uniqueBots.length - 1) && botExists == false) {
                        document.getElementById('testBots').children[i].remove();
                        document.getElementById('testBots').children[i].remove();
                    }
                }
            }
        })
    }

    update();
    setInterval(update, 5000);
});