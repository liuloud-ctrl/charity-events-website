// =============================================================================
// event_db.js
// -----------------------------------------------------------------------------
// Node.js connection file for the charityevents_db MySQL database.
// This file is required by the REST API (server.js) to run SQL queries.
//
// Before running the server, make sure:
//   1) The database has been created   -> run database/charityevents_db.sql
//   2) The password below matches your local MySQL "root" user.
// =============================================================================

const mysql = require('mysql2');

// Create a connection to the MySQL server.
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'LCW213544',            // <-- local MySQL root password
    database: 'charityevents_db'
});

// Test the connection and report success / failure in the console.
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to charityevents_db database successfully.');
});

// Export the connection so other modules can use it.
module.exports = db;
