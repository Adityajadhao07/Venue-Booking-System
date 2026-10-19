const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Middleware so Express can understand JSON data sent from the frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS) from a folder named 'public'
app.use(express.static('public'));

// Connect to your venues database
const db = new sqlite3.Database('./venues.db', (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to venues.db');
});

// ---------------------------------------------------------
// 1. GET AVAILABLE VENUES (Excludes rooms with approved bookings)
// ---------------------------------------------------------
app.get('/api/venues', (req, res) => {
    const query = `
        SELECT * FROM classrooms 
        WHERE id NOT IN (
            SELECT venue_id FROM bookings WHERE status = 'approved'
        )
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ---------------------------------------------------------
// 2. SUBMIT A BOOKING REQUEST (Student side)
// ---------------------------------------------------------
app.post('/api/bookings', (req, res) => {
    const { userId, venueId, expectedAttendees, requirements } = req.body;

    const query = `
        INSERT INTO bookings (user_id, venue_id, expected_attendees, requirements, status) 
        VALUES (?, ?, ?, ?, 'pending')
    `;

    db.run(query, [userId, venueId, expectedAttendees, requirements], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Booking request submitted successfully!', bookingId: this.lastID });
    });
});

// ---------------------------------------------------------
// 3. GET PENDING BOOKINGS (Admin side)
// ---------------------------------------------------------
app.get('/api/bookings/pending', (req, res) => {
    const query = `
        SELECT b.id AS bookingId, b.user_id, c.name AS venueName, 
               b.expected_attendees, b.requirements, b.status 
        FROM bookings b
        JOIN classrooms c ON b.venue_id = c.id
        WHERE b.status = 'pending'
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ---------------------------------------------------------
// 4. APPROVE OR REJECT BOOKING (Admin side)
// ---------------------------------------------------------
app.post('/api/bookings/:id/action', (req, res) => {
    const { status } = req.body; // Expects 'approved' or 'rejected'
    const bookingId = req.params.id;

    const query = `UPDATE bookings SET status = ? WHERE id = ?`;

    db.run(query, [status, bookingId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Booking has been ${status} successfully.` });
    });
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running live at http://localhost:3000');
});
