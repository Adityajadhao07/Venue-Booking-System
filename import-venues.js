const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Open the database
const db = new sqlite3.Database('./venues.db');

// Read the JSON file you edited
const rawData = fs.readFileSync('venues.json');
const venuesList = JSON.parse(rawData);

db.serialize(() => {
    // Clear old entries so it refreshes cleanly with your latest edits
    db.run(`DELETE FROM classrooms`);

    // Loop through your JSON entries and insert them into the database
    venuesList.forEach((venue) => {
        db.run(
            `INSERT INTO classrooms (name, capacity, type) VALUES (?, ?, ?)`,
            [venue.name, venue.capacity, venue.type],
            (err) => {
                if (err) console.error("Error inserting:", err.message);
            }
        );
    });

    console.log("Success! Your custom entries from venues.json are now loaded into the database.");
});
