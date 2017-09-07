'use strict';
const mysql = require('mysql');
const sanitizer = require('sanitizer');
const login = require('./login.json');
const util = require('util');

exports.get_all_guests = function(req, res) {
    var connection = getConnection();

    connection.end((err) => {
        console.log('Error ending db connection ' + err.code + ' ' + message);
    });
}

exports.create_guest = function(request, response) {
    var connection = getConnection();

    connection.query('INSERT INTO guest SET ?', request.body, (db_error, db_response) => {
        if (db_error) {
            console.log('Error inserting '+ request.body + '-' + db_error.code + ' ' + db_error.message);
            throw err;
        }
        console.log('Inserted ID ' + db_response.insertId);
        response.status(200).json({"ID": db_response.insertId});
    });

    connection.end((err) => {
        if (err) {
            console.log('Error ending db connection ' + err.code + ' ' + message);
        }
    });
}

exports.get_guest = function(request, response) {
    try {
        var ID = request.params.guestId;
        if (!ID) {
            throw {"name": "InternalError", "source": "getGuestDetails", "message":'No ID specified'};
        }
        var guest = {};

        var connection = getConnection();

        connection.query("SELECT * FROM guest WHERE id = ?", ID, (db_error, db_results) => {
            console.log('connection found ' + db_results.length + ' things');
            if (db_results.length) {
                var result = db_results[0];
                response.status(200).json({
                    "id": result.id,
                    "name": result.name, 
                    "address_1": result.address_1,
                    "address_2": result.address_2, 
                    "city": result.city,
                    "state": result.state, 
                    "zip_code": result.zip_code, 
                    "suggested_guest_count": result.suggested_guest_count,
                    "guest_count": result.guest_count,
                    "status": result.status
                });
            }
            else {
                throw {"name": "InternalError", "source": "get_guest", "message":'No record found with ID' + ID};
            }
        });
        connection.end();
    }
    catch (exception) {
        console.log("Error updating guest: " + util.inspect(exception));
        if (!response.finished) response.status(500).json(exception);
    }
}

exports.search_guests = function(request, response) {
    try {
        var lastName = request.params.lastName;

        if (!lastName) {
            response.status(400).json({"message": "No search term provided"});
            throw {"name": "BadRequestMessage", "source": "search_guests", "message": req.params};
        }

        var connection = getConnection();

        connection.query("SELECT id, name FROM guest WHERE last_name = ?", lastName,  (db_error, rows) => {
            if (db_error) throw {"name": "DatabaseError", "source": "search_guests", "message": 'Error updating ID ' + request.params + ' - '+ request.body + ' - ' + db_error};

            console.log('found ' + rows.length + ' rows for ' + lastName);
            var result = [];
            if (rows.length) {
                rows.forEach( (row) => {
                    result.push({"id" : row.id, "name": row.name});
                });
            }
            response.status(200).json(result);
        });
    }
    catch (exception) {
        console.log("Error searching guests: " + util.inspect(exception));
        if (!response.finished) response.status(500).json(exception);
    }
}

exports.update_guest = function(req, response) {
    try {
        var guestId = req.params.guestId;
        var allowedFields = ['name', 'address_1', 'address_2', 'city', 'state', 'zip_code', 'suggested_guest_count', 'guest_count', 'status', 'last_name'];
        
        if (req.body.id && (req.body.id !== guestId)) {
            response.status(400).json({"message": "Updating the id of a guest is not allowed!"});
            throw {"name": "BadRequestMessage", "source": "update_guest", "message": req.params + req.body};
        }

        for (var field in req.body) {
            if (!allowedFields.includes(field)) {
                response.status(400).json({"message": "Incorrect field name included in request: " + field});
                throw {"name": "BadRequestMessage", "source": "update_guest", "message": req.params + req.body};
            }
        }

        var connection = getConnection();    

        if (req.params.guestId) {
            connection.query('UPDATE guest SET ? WHERE ID = ?', [req.body, parseInt(req.params.guestId)], (db_error, db_response) => {
                if (db_error) throw {"name": "DatabaseError", "source": "update_guest", "message": 'Error updating ID ' + req.params.guestId + ' - '+ req.body + ' - ' + db_error};

                console.log('Updated ID ' + guestId);
                response.sendStatus(200);
            });
        }

        connection.end((err) => {
            if (err) throw {"name": "DatabaseError", "source": "update_guest", "message":'Error ending db connection ' + err};
        });
    }
    catch (exception) {
        console.log("Error updating guest: " + util.inspect(exception));
        if (!response.finished) response.status(500).json(exception);
    }
}

function getGuestDetails(ID) {
    try {
        if (!ID) {
            throw {"name": "InternalError", "source": "getGuestDetails", "message":'No ID specified'};
        }
        var guest = {};

        var connection = getConnection();

        connection.query("SELECT * FROM guest WHERE id = ?", ID, (db_error, db_results) => {
            console.log('connection found ' + db_results.length + ' things');
            if (db_results.length) {
                var result = db_results[0];
                guest = {
                    "id": result.id,
                    "name": result.name, 
                    "address_1": result.address_1,
                    "address_2": result.address_2, 
                    "city": result.city,
                    "state": result.state, 
                    "zip_code": result.zip_code, 
                    "suggested_guest_count": result.suggested_guest_count,
                    "guest_count": result.guest_count,
                    "status": result.status
                };
                return guest;
            }
            else {
                throw {"name": "InternalError", "source": "getGuestDetails", "message":'No record found with ID' + ID};
            }
        });
        connection.end();
    }
    catch (exception) {
        console.log('error getting guestDetails ' + util.inspect(exception));
    }
}

function getConnection() {
    const connection = mysql.createConnection(login);
    connection.connect((err) => {
        if (err) {
            console.log('Error connecting to db ' + err.code + ' ' + err.message);
            throw err;
        }
    });
    return connection;
}