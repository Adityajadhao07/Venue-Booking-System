const sqlite3 = require('sqlite3').verbose();

// Creates the database file on your computer
const db = new sqlite3.Database('./venues.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to venues.db successfully.');
    }
});

// Sets up the table layout
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS classrooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        capacity INTEGER,
        type TEXT
    )`);
    console.log("Classrooms table is ready.");
});

module.exports = db;
