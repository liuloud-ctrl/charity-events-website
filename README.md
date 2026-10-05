# Charity Events Website — PROG2002 Assignment 2

A dynamic website that manages charity events in the city. Users can view
current and upcoming events on the Home page, search events by date / location /
category on the Search page, and view full event details (including ticket
information and fundraising goal vs progress) on the Event detail page.

**Technologies:** Node.js, Express, MySQL, HTML, CSS, JavaScript (DOM + Promises).

> Only **GET** endpoints are implemented. POST/PUT/DELETE (registration and
> admin features) are added in Assessment 3.

---

## Project structure

```
charity-events-website/
├── database/
│   └── charityevents_db.sql     # database schema + 11 sample events
├── server/
│   ├── package.json             # dependencies (express, mysql2)
│   ├── event_db.js              # MySQL connection file
│   └── server.js                # Express REST API
├── public/                      # client-side website (served by Express)
│   ├── index.html               # Home page
│   ├── search.html              # Search page
│   ├── event.html               # Event detail page
│   ├── css/style.css            # shared styles
│   └── js/
│       ├── api.js               # shared API helper + card builder
│       ├── home.js              # Home page logic
│       ├── search.js            # Search page logic
│       └── event.js             # Event detail page logic
└── README.md
```

---

## How to run

### 1. Create the database

Open MySQL Workbench or a terminal and run:

```bash
mysql -u root -p < database/charityevents_db.sql
```

This creates the `charityevents_db` database, all tables and 11 sample events.

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Set your MySQL password

Open `server/event_db.js` and change `password` to your MySQL root password.

### 4. Start the API + website

```bash
npm start
```

Then open <http://localhost:3000> in your browser.

---

## API endpoints

| Method | Endpoint              | Purpose                                  | Page        |
|--------|-----------------------|------------------------------------------|-------------|
| GET    | `/api/events`         | Active + upcoming events (with category) | Home        |
| GET    | `/api/events/search`  | Search by date / location / category     | Search      |
| GET    | `/api/events/:id`     | Full details of a single event           | Event detail|
| GET    | `/api/categories`     | List of event categories                 | Search      |

### Example search request

```
GET /api/events/search?date=2026-11-08&location=Sydney&category=1
```

All three query parameters are optional; only the ones supplied are used to
filter the results.

---

## Sample event dates

The sample data uses dates relative to October 2026. If you run the site much
later, update the `event_date` values in `database/charityevents_db.sql` (and
re-run the file) so the "upcoming" events remain in the future. One sample
event is marked `status = 'suspended'` to demonstrate that suspended events are
hidden from the website.
