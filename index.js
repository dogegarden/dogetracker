const App = new (require('./src/classes/App'));
const Logger = require('./src/util/Logger');
const Cron = require('./src/util/cron');

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async function () {
    await App.registerRoutes();
    await App.listen(() => {
        Logger.info(`Express started on on port ${process.env.EXPRESS_PORT}`);
    }, true);
    Cron.setCron();
    // Cron.autoRunMYSQL();
})()
