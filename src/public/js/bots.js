$(document).ready(function () {
    function update() {
        $.ajax({
            url: '/api/bots',
            success: (payload) => {
                console.log(payload)
                // Total Rooms
                document.getElementById('totalServeredUsers').innerHTML = payload.botAccounts.room.map(it => it.listening).reduce((a, b) => a + b, 0);
                document.getElementById('totalBotsSendingTelemetry').innerHTML = payload.totalBots;

                if (payload.botAccounts.totalBotsOnline == 1) {
                    document.getElementById('botsOnline').innerHTML = payload.botAccounts.totalBotsOnline + ' Bot Online';
                } else if (payload.botAccounts.totalBotsOnline == 0) {
                    document.getElementById('botsOnline').innerHTML = 'No bots online :(';
                } else {
                    document.getElementById('botsOnline').innerHTML = payload.botAccounts.totalBotsOnline + ' Bots Online';
                }

                // bots

                let bots = []

                for (let i = 0; i < payload.botAccounts.botsOnline.length; i++) {
                    bots[i] = payload.botAccounts.botsOnline[i].bot.username;
                }
                // list bots or bot
                document.getElementById('botsList').innerHTML = "Bot" + ((bots[i].length === 1) ? ": " : "s: ") + bots[i]
    

          
                

            }
        });
    }

    update();
    setInterval(update, 5000);
});
// s3ansh33p - nothing sus