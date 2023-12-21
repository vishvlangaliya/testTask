
const http = require('http');
const express = require('express');
const socket = require('./helper/socket');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

/* for nosql */
const nosql = require('./db/nosql');
/* for nosql */

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));

app.use(cors())

/* nosql connection */
nosql.db_connection()
/* nosql connection */

/* apidoc  */
app.use('/web_api_doc', express.static('./apidoc/web_api'));
/* apidoc  */

app.use(express.static(__dirname + '/public/images'));

app.use('/web/v1', require('./routes/web_routes'));

app.use('/backup/v1', require('./routes/backup_routes'));
/* socket */
socket.init(server);
/* socket */

/* Express Custom Function */
require("./common/express_custom_function")(express);

server.listen(process.env.PORT || 3005, (err) => {
    if (err) throw (err);
    console.log('Server Up And Working');
});
