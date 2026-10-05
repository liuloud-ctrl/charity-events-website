// =============================================================================
// home.js - Home page logic.
// Fetches the active + upcoming events from GET /api/events and renders them.
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('event-grid');
    const empty = document.getElementById('event-list');

    apiGet('/api/events')
        .then((events) => {
            if (!events || events.length === 0) {
                empty.hidden = false;
                empty.textContent = 'No current or upcoming events are available right now.';
                return;
            }

            // Render each event as a card using the shared DOM builder.
            events.forEach((event) => {
                grid.appendChild(buildEventCard(event));
            });
        })
        .catch((err) => {
            empty.hidden = false;
            empty.textContent = 'Sorry, we could not load the events. ' + err.message;
        });
});
