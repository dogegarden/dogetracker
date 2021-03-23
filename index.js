const App = new (require('./src/classes/App'));
const Logger = require('./src/util/Logger');
// const Cron = require('./src/util/cron');

(async function () {
    await App.registerRoutes();
    await App.listen(() => {
        Logger.info(`Express started on on port ${process.env.EXPRESS_PORT}`);
    }, true);
})();