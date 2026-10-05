// =============================================================================
// server.js
// -----------------------------------------------------------------------------
// Express REST API for the charity events website (PROG2002 Assignment 2).
//
// This API ONLY provides GET endpoints (POST/PUT/DELETE are added in
// Assessment 3). It serves the data required by the three client pages:
//   Home   -> GET /api/events        (active + upcoming events)
//   Search -> GET /api/events/search + GET /api/categories
//   Detail -> GET /api/events/:id
//
// To run:  cd server && npm install && npm start
// The client website is served from the "public" folder at http://localhost:3000
// =============================================================================

const express = require('express');
const path = require('path');
const db = require('./event_db');

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------
app.use(express.json());                // parse JSON request bodies (needed in A3)
// Serve the client-side website (absolute path so it works from any folder).
app.use(express.static(path.join(__dirname, '..', 'public')));

// -----------------------------------------------------------------------------
// Helper: the SQL fragment that marks an event as current/upcoming or past.
// An event is "current/upcoming" when its date is today or in the future.
// -----------------------------------------------------------------------------
const UPCOMING = "e.event_date >= CURDATE()";

// -----------------------------------------------------------------------------
// Endpoint 1: GET /api/categories
// Returns all event categories (used to populate the search filter).
// -----------------------------------------------------------------------------
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT category_id, category_name FROM categories ORDER BY category_name';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve categories.' });
        }
        res.json(results);
    });
});

// -----------------------------------------------------------------------------
// Endpoint 2: GET /api/events
// Returns all ACTIVE events that are current/upcoming (today or in the future).
// Used by the Home page to build the event listing.
// -----------------------------------------------------------------------------
app.get('/api/events', (req, res) => {
    const sql = `
        SELECT e.event_id, e.event_name,
               DATE_FORMAT(e.event_date, '%Y-%m-%d') AS event_date,
               DATE_FORMAT(e.event_time, '%H:%i:%s') AS event_time, e.location,
               e.ticket_price, e.image_url, e.event_purpose, e.goal_amount,
               e.progress_amount, c.category_name, o.org_name
        FROM events e
        JOIN categories c     ON e.category_id  = c.category_id
        JOIN organisations o  ON e.org_id       = o.org_id
        WHERE e.status = 'active' AND ${UPCOMING}
        ORDER BY e.event_date ASC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve events.' });
        }
        res.json(results);
    });
});

// -----------------------------------------------------------------------------
// Endpoint 3: GET /api/events/search
// Searches ACTIVE events by one or more criteria: date, location, category.
// All query parameters are optional; only the ones supplied are applied.
//   ?date=YYYY-MM-DD      exact date
//   ?location=keyword     partial match on the location field
//   ?category=id          category id
// -----------------------------------------------------------------------------
app.get('/api/events/search', (req, res) => {
    const { date, location, category } = req.query;

    // Build the WHERE clause dynamically from the provided criteria.
    const conditions = ["e.status = 'active'"];
    const params = [];

    if (date) {
        conditions.push('e.event_date = ?');
        params.push(date);
    }
    if (location) {
        conditions.push('e.location LIKE ?');
        params.push(`%${location}%`);
    }
    if (category) {
        conditions.push('e.category_id = ?');
        params.push(category);
    }

    const sql = `
        SELECT e.event_id, e.event_name,
               DATE_FORMAT(e.event_date, '%Y-%m-%d') AS event_date,
               DATE_FORMAT(e.event_time, '%H:%i:%s') AS event_time, e.location,
               e.ticket_price, e.image_url, e.event_purpose, e.goal_amount,
               e.progress_amount, c.category_name, o.org_name
        FROM events e
        JOIN categories c     ON e.category_id  = c.category_id
        JOIN organisations o  ON e.org_id       = o.org_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY e.event_date ASC
    `;
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error searching events:', err.message);
            return res.status(500).json({ error: 'Failed to search events.' });
        }
        res.json(results);
    });
});

// -----------------------------------------------------------------------------
// Endpoint 4: GET /api/events/:id
// Returns the full details of a single ACTIVE event (used by the Event page).
// -----------------------------------------------------------------------------
app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id;

    // Basic input validation - reject anything that is not a positive integer.
    if (!/^\d+$/.test(eventId)) {
        return res.status(400).json({ error: 'Invalid event id.' });
    }

    const sql = `
        SELECT e.event_id, e.event_name, e.event_description, e.event_purpose,
               DATE_FORMAT(e.event_date, '%Y-%m-%d') AS event_date,
               DATE_FORMAT(e.event_time, '%H:%i:%s') AS event_time,
               e.location, e.venue_address,
               e.ticket_price, e.goal_amount, e.progress_amount, e.image_url,
               e.status, c.category_name, o.org_name, o.org_description,
               o.email AS org_email, o.phone AS org_phone
        FROM events e
        JOIN categories c     ON e.category_id  = c.category_id
        JOIN organisations o  ON e.org_id       = o.org_id
        WHERE e.event_id = ? AND e.status = 'active'
    `;
    db.query(sql, [eventId], (err, results) => {
        if (err) {
            console.error('Error fetching event:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve the event.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        res.json(results[0]);
    });
});

// -----------------------------------------------------------------------------
// Start the server
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Charity events API running at http://localhost:${PORT}`);
});
