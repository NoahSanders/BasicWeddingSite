const express = require('express');
const bodyParser = require('body-parser');

const util = require('util');

var listen = function() {
    var app = express();
    var port = process.env.PORT || 3000;

    app.use(bodyParser.urlencoded({extended: true }));
    app.use(bodyParser.json());

    var routes = require('./routes/guestRoutes');
    routes(app);

    app.listen(port);
    console.log('API started on ' + port);
};

listen();

function createGuest(guestObject, connection) {
    
}