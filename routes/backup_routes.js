const backup_routes = require('express').Router();

const middlewares = require('../helper/middlewares');

/* controller */
const backup = require('../helper/db_backup');
/* controller */

backup_routes.get('/create', middlewares.backupMiddleWares, backup.create);
backup_routes.get('/restore', middlewares.backupMiddleWares, backup.restore);

module.exports = backup_routes;