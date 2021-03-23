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

            }
        });
    }

    update();
    setInterval(update, 5000);
});
// s3ansh33p - nothing sus