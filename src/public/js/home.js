let lookup = ['Live', '24h', 'Week', 'Month', 'All Time'];

$('.dropdown-menu.keep-open').on('click', function (e) {
    e.stopPropagation();
});

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        $(".fsl").addClass('min-w');

    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen(); 
        $(".fsl").removeClass('min-w');

      }
    }
  }

function dropdownUpdate(element) {
    document.getElementById(element.parentElement.getAttribute('aria-labelledby')).innerText = element.innerText;
    changeDataset(((element.parentElement.getAttribute('aria-labelledby') == 'userActivityChartTimeframe') ? 'statsChart' : 'roomsChart'), element.innerText)
}

function optionUpdate(element) {
    if (element.innerText.trim() != 'Show Maximum' && element.innerText.trim() != 'Show Minimum') {
        console.log(`ERROR: Received: ${element.innerText}`);
    } else {        
        // console.log(element.innerText)
        // console.log(element.parentElement.parentElement.parentElement.children[0].innerText.trim())
        // console.log(chartConfig.options["_"+element.parentElement.parentElement.parentElement.children[0].innerText.trim()])
        let canvasID = ((element.parentElement.getAttribute('aria-labelledby') == 'userActivityChartOptions') ? 'statsChart' : 'roomsChart');
        let configIndex = 0;
        let opt = ["dropOptMin","dropOptMax"]
        if (element.innerText.trim() == 'Show Maximum') configIndex = 1;
        let timeFrame = element.parentElement.parentElement.parentElement.children[0].innerText.trim();
        window.chartConfig.options["_"+timeFrame][Object.keys(window.chartConfig.options["_"+timeFrame])[configIndex]] = document.getElementById(opt[configIndex]).checked;
        // Add or remove
        let dataName = ``;
        if (canvasID == 'statsChart') {
            dataName = 'totalOnline'
            curChart = window.chart;
        } else {
            dataName = 'totalRooms'
            curChart = window.chartRooms;
        }
        let isHidden = (document.getElementById(opt[configIndex]).checked == true) ? false : true;
        curChart.data.datasets[(configIndex+1)]._meta[0].hidden = isHidden;
        // if (document.getElementById(opt[configIndex]).checked == true) {
        //     // Add the data
        //     // curChart.data.datasets[(configIndex+1)].data = statsConfig[(5+configIndex)].map(({ [`${dataName}`]: val }) => val);    
            
        // } else {
        //     // Remove the data
        //     // curChart.data.datasets[(configIndex+1)].data = [];
        // }
        curChart.update();
    }
}

function changeDataset(canvasID, value) {
    // console.log(`Canvas ${canvasID} | value ${value}`)
    let curChart;
    let lookupIndex = lookup.indexOf(value);
    let dataName = ``;
    if (canvasID == 'statsChart') {
        dataName = 'totalOnline'
        curChart = window.chart;
    } else {
        dataName = 'totalRooms'
        curChart = window.chartRooms;
    }
    // Update chart
    // What data do we want to update
    if (lookupIndex != -1) {
        // (new Date).toLocaleTimeString()
        curChart.data.datasets[0].data = statsConfig[lookupIndex].map(({ [`${dataName}`]: val }) => val);
        curChart.options.scales.xAxes[0].scaleLabel.labelString = "Time";
    }

    if (lookupIndex == 0) {
        // Live
        curChart.data.labels = statsConfig[0].map(({ [`statsTime`]: val }) => val);
        curChart.options.scales.xAxes[0].scaleLabel.labelString = "Seconds";
        curChart.options.tooltips.callbacks.title = function(t, d) {
            return "Time: "+d.labels[t[0].index]+" seconds";
         }
        // window.chartConfig.step = 0;
        // Consider storing this data in the background
    } else if (lookupIndex == 1) {
        // 24h
        curChart.data.labels = statsConfig[1].map(({ [`statsTime`]: val }) => new Date(val).getHours());
        curChart.options.tooltips.callbacks.title = function(t, d) {
            return "Time: "+d.labels[t[0].index]+" hours";
         }
    } else if (lookupIndex == 2) {
        // Weeks
        let days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        curChart.data.labels = statsConfig[2].map(({ [`statsTime`]: val }) => days[new Date(val).getDay()]+" "+new Date(val).getHours()+":"+new Date(val).getMinutes());
        curChart.options.tooltips.callbacks.title = function(t, d) {
            return "Time: "+d.labels[t[0].index];
         }
    } else if (lookupIndex == 3) {
        // Month
        curChart.data.labels = statsConfig[3].map(({ [`statsTime`]: val }) => new Date(val).toLocaleDateString());
        curChart.options.tooltips.callbacks.title = function(t, d) {
            return "Time: "+d.labels[t[0].index];
         }
    } else if (lookupIndex == 4) {
        // All Time
        // Store start date as value and work out day, week, month, year
        curChart.data.labels = statsConfig[4].map(({ [`statsTime`]: val }) => new Date(val).toLocaleDateString());
        curChart.options.tooltips.callbacks.title = function(t, d) {
            return "Time: "+d.labels[t[0].index];
         }
    } else {
        console.log(`Error | lookupIndex ${lookupIndex} | Input: canvasID ${canvasID} , value ${value}`);
    }
    curChart.update();
}

$(document).ready(function () {

    // [ [ live ], [ 24h - average ], [ week - average ], [ month - average ], [ alltime - average ], [ 24h - min ], [ 24h - max ] ]
    window.statsConfig = [[],[],[],[],[],[],[]];

    function getLongTermData() {
        $.ajax({
            url: '/api/mysql?time=24h',
            success: (payload) => {
                // console.log(payload);
                // Get hours from each
                // Group by hours
                // find min, max, average
                // push average to data
                // min and max to another index of statsConfig

                let avgData = [];
                let minData = [];
                let maxData = [];
                let dmap = new Map();

                payload.forEach(function(curData) {
                    let timestamp = new Date(curData.statsTime);
                    let h = timestamp.getHours();
                    let m = timestamp.getMinutes();
                    if (!dmap[h]) dmap[h]={};
                    dmap[h][m] = curData;
                })
                Object.getOwnPropertyNames(dmap).length
                for (i=0; i<Object.getOwnPropertyNames(dmap).length; i++) {
                    let avgR = 0;
                    let avgO = 0;
                    let minR = 0;
                    let minO = 0;
                    let maxR = 0;
                    let maxO = 0;
                    for (j=0; j<Object.getOwnPropertyNames(dmap[Object.getOwnPropertyNames(dmap)[i]]).length; j++) {
                        a = dmap[Object.getOwnPropertyNames(dmap)[i]][Object.getOwnPropertyNames(dmap[Object.getOwnPropertyNames(dmap)[i]])[j]];
                        if (j == 0) {
                            minR = a.totalRooms;
                            minO = a.totalOnline;
                        }
                        avgR += a.totalRooms;
                        avgO += a.totalOnline;
                        if (minR > a.totalRooms) minR = a.totalRooms;
                        if (minO > a.totalOnline) minO = a.totalOnline;
                        if (maxR < a.totalRooms) maxR = a.totalRooms;
                        if (maxO < a.totalOnline) maxO = a.totalOnline;
                        if (j == Object.getOwnPropertyNames(dmap[Object.getOwnPropertyNames(dmap)[i]]).length - 1) {
                            avgR = Math.round(avgR / (j+1) * 2)/2;
                            avgO = Math.round(avgO / (j+1) * 2)/2;
                            t = a.statsTime;
                            time = new Date(t).getTime() - new Date(t).getMinutes()*60000 - new Date(t).getSeconds()*1000 - new Date(t).getMilliseconds();
                            avgData.push({
                                'totalRooms' : avgR,
                                'totalOnline' : avgO,
                                'statsTime' : time
                            })
                            minData.push({
                                'totalRooms' : minR,
                                'totalOnline' : minO,
                                'statsTime' : time
                            })
                            maxData.push({
                                'totalRooms' : maxR,
                                'totalOnline' : maxO,
                                'statsTime' : time
                            })
                        }
                    }
                }

                statsConfig[1] = avgData;
                statsConfig[5] = minData;
                statsConfig[6] = maxData;
                chart.data.datasets[1].data = statsConfig[5].map(({ [`totalOnline`]: val }) => val);
                chart.data.datasets[2].data = statsConfig[6].map(({ [`totalOnline`]: val }) => val);
                chart.data.datasets[1]._meta[0].hidden = true;
                chart.data.datasets[2]._meta[0].hidden = true;
                changeDataset('statsChart', '24h');
                changeDataset('roomsChart', '24h');
            }
        })
        $.ajax({
            url: '/api/mysql?time=week',
            success: (payload) => {
                statsConfig[2] = payload;
            }
        })
        $.ajax({
            url: '/api/mysql?time=month',
            success: (payload) => {
                statsConfig[3] = payload;
            }
        })
        $.ajax({
            url: '/api/mysql?time=alltime',
            success: (payload) => {
                statsConfig[4] = payload;
            }
        })
    }

    getLongTermData();

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
                document.getElementById('botsProvidingTelem').innerHTML = payload.totalBotsSendingTelemetry + '/' + payload.totalBotsOnline + ' bots providing telemetry via <a href="https://github.com/dogegarden/dogehouse.js">dogehouse.js</a> & <a href="https://github.com/Arthurdw/dogehouse.py">dogehouse.py</>'

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

                        element.innerHTML = text + " (" + (days === 0 ? "" : "Days: " + days + " | ") + "Hours: " + hours + " | Minutes: " + minutes + ")";

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
                        'limit': 100,
                        'options' : {
                            '_live' : {
                                // Todo
                            },
                            '_24h' : {
                                'min' : false,
                                'max' : false
                            },
                            '_week' : {
                                'min' : false,
                                'max' : false
                            },
                            '_month' : {
                                'min' : false,
                                'max' : false
                            },
                            '_alltime' : {
                                'min' : false,
                                'max' : false
                            }
                        }
                    }
                };

                // Stats config
                statsConfig[0].push({
                    'totalRooms' : payload.totalRooms,
                    'totalOnline' : payload.totalOnline,
                    'statsTime' : window.chartConfig.step * 5
                });

                window.chartConfig.step++;
                var time = window.chartConfig.step * 5;
                
                // Check for removal
                if (window.chart.data.datasets[0].data.length >= window.chartConfig.limit) {
                    statsConfig[0] = statsConfig[0].slice(1);
                }

                // User Acitivty Chart
                changeDataset('statsChart',document.getElementById("userActivityChartTimeframe").innerText.trim())

                // Room Acitivty Chart
                changeDataset('roomsChart',document.getElementById("roomActivityChartTimeframe").innerText.trim())

                // Update
                window.chart.update();
                window.chartRooms.update();

                var userRoomChart = document.getElementById("botuserChart");
                var userRoomData = {
                    labels: [
                        "Users Online",
                        "Bots Online"
                    ],
                    datasets: [
                        
                        {
                            borderColor: false,
                            data: [payload.totalOnline - payload.totalBotsOnline, payload.totalBotsOnline],
                            backgroundColor: [
                                "rgba(244, 5, 95, 0.55)",
                                "rgba(5, 89, 244, 0.55)",
                                "rgba(244, 140, 5, 0.55)"
                            ]
                        }]
                };
        
                let UserBotChart = new Chart(userRoomChart, {
                type: 'doughnut',
                data: userRoomData,
                options: {
                    animation: false,
                    legend: {
                        color: '#cacaca'
                    },
                    defaultFontColor: '#000'
                }
                });

                // rooms / users
                var userRoomChart = document.getElementById("userroomChart");
                var userRoomData = {
                    labels: [
                        "Users Online",
                        "Rooms",
                        "Bots Online"
                    ],
                    datasets: [
                        
                        {
                            borderColor: false,
                            data: [payload.totalOnline - payload.totalBotsOnline, payload.totalRooms, payload.totalBotsOnline],
                            backgroundColor: [
                                "rgba(244, 5, 95, 0.55)",
                                "rgba(5, 89, 244, 0.55)",
                                "rgba(244, 140, 5, 0.55)"
                            ]
                        }]
                };
        
                let UserRoomDoughnutChart = new Chart(userRoomChart, {
                type: 'doughnut',
                data: userRoomData,
                options: {
                    segmentShowStroke: false,
                    animation: false,
                    legend: {
                        color: '#cacaca'
                    },
                }
                });

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
                                    <img class="account-avatar" src="${uniqueBots[i].bot.avatar}">
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
                                document.getElementsByClassName("uuid")[j].parentElement.parentElement.children[2].innerHTML = `<i class="fas fa-user-friends" aria-hidden="true"></i> ` + ((uniqueBots[i].room.listening == "No Room") ? 0 : uniqueBots[i].room.listening);
                                document.getElementsByClassName("uuid")[j].parentElement.children[2].innerText = (uniqueBots[i].room.name == null) ? "" : uniqueBots[i].room.name;
                                // document.getElementsByClassName("uuid")[j].parentElement.parentElement.children[0].src = uniqueBots[i].bot.avatar;
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

    function checkAPIStatus() {
        try {
            $.ajax({
                url: 'https://api.dogehouse.xyz',
                timeout: 1500,
                error: function() {
                    $("#api-alert").removeClass('show');
                },
            })
        } catch(err) {
            //no 1 cares about err so we ignore it :)
        }
    }
    checkAPIStatus()
    update();
    setInterval(update, 5000);
    setInterval(checkAPIStatus, 10000);
});
