// =============================================================================
// api.js - shared helper for talking to the REST API.
// Every page uses fetch() + Promises to retrieve data and render it with DOM.
// =============================================================================

// Base URL of the Express API (same origin, because the server also serves
// the static website from the "public" folder).
const API_BASE = '';

/**
 * Generic GET helper.
 * @param {string} endpoint  - e.g. '/api/events' or '/api/events/search?category=1'
 * @returns {Promise<Array|Object>} resolved JSON body, or rejects on error.
 */
function apiGet(endpoint) {
    return fetch(`${API_BASE}${endpoint}`)
        .then((response) => {
            if (!response.ok) {
                // Turn non-2xx responses into an Error we can display to the user.
                return response.json().then((data) => {
                    throw new Error(data.error || `Request failed (${response.status})`);
                });
            }
            return response.json();
        });
}

/**
 * Format a MySQL date into a readable format, e.g. "8 Nov 2026".
 * Handles both 'YYYY-MM-DD' strings and ISO datetime strings that mysql2
 * may return (e.g. "2026-10-17T16:00:00.000Z").
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    let d;
    if (String(dateStr).includes('T')) {
        // ISO datetime returned by mysql2 (serialised as a UTC timestamp)
        d = new Date(dateStr);
    } else {
        d = new Date(String(dateStr).slice(0, 10) + 'T00:00:00');
    }
    if (isNaN(d.getTime())) return String(dateStr).slice(0, 10);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format a MySQL TIME (HH:MM:SS) into 12-hour time, e.g. "8:00 AM".
 */
function formatTime(timeStr) {
    if (!timeStr) return '';
    const parts = String(timeStr).split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${suffix}`;
}

/**
 * Format a ticket price. Returns "Free" when price is 0.
 */
function formatPrice(price) {
    const n = Number(price);
    if (!n) return 'Free';
    return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2 });
}

/**
 * Build one event "card" element. Used on both the Home and Search pages.
 * @param {Object} event - one event row from the API.
 * @returns {HTMLElement} a clickable card linking to event.html?id=...
 */
function buildEventCard(event) {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = event.image_url || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800';
    img.alt = event.event_name;
    img.loading = 'lazy';
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.textContent = event.event_name;
    body.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.innerHTML =
        '<span>' + formatDate(event.event_date) + (event.event_time ? ' · ' + formatTime(event.event_time) : '') + '</span>' +
        '<span>' + (event.location || '') + '</span>';
    body.appendChild(meta);

    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = event.category_name || '';
    body.appendChild(chip);

    if (event.event_purpose) {
        const purpose = document.createElement('p');
        purpose.textContent = event.event_purpose;
        body.appendChild(purpose);
    }

    const price = document.createElement('div');
    price.className = 'price' + (Number(event.ticket_price) === 0 ? ' free' : '');
    price.textContent = 'Ticket: ' + formatPrice(event.ticket_price);
    body.appendChild(price);

    const link = document.createElement('a');
    link.className = 'btn';
    link.href = 'event.html?id=' + event.event_id;
    link.textContent = 'View Details';
    body.appendChild(link);

    card.appendChild(body);
    return card;
}
