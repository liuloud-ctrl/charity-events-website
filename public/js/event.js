// =============================================================================
// event.js - Event detail page logic.
//  - Reads the event id from the URL query string (?id=...)
//  - Fetches the full event via GET /api/events/:id
//  - Renders the details, ticket info, and goal-vs-progress bar
//  - "Register" button shows a "under construction" modal (DOM)
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('detail-root');
    const modal = document.getElementById('register-modal');

    // --- 1. Read the event id from the query string ---
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        root.innerHTML = '<p class="empty">No event was selected. Please go back and choose an event.</p>';
        return;
    }

    // --- 2. Fetch the full details of this single event ---
    apiGet('/api/events/' + eventId)
        .then((event) => {
            root.innerHTML = '';                 // clear the loading text
            root.appendChild(buildDetailPage(event));
        })
        .catch((err) => {
            root.innerHTML = '';
            const msg = document.createElement('p');
            msg.className = 'empty';
            msg.textContent = 'Could not load this event: ' + err.message;
            root.appendChild(msg);
        });

    // --- 3. Register button -> "under construction" modal ---
    // The modal close button and the register button are wired up after the
    // detail page is rendered, because the Register button is created there.
    root.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'register-btn') {
            modal.classList.add('visible');
        }
    });
    document.getElementById('modal-close').addEventListener('click', () => {
        modal.classList.remove('visible');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('visible');
    });
});

/**
 * Build the full event-detail layout using DOM creation (all dynamic values are
 * set with textContent to prevent script injection).
 */
function buildDetailPage(event) {
    const wrap = document.createElement('div');

    // --- Hero: image + key details ---
    const hero = document.createElement('div');
    hero.className = 'detail-hero';

    const img = document.createElement('img');
    img.src = event.image_url || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800';
    img.alt = event.event_name;
    hero.appendChild(img);

    const info = document.createElement('div');
    info.className = 'detail-info';

    const h1 = document.createElement('h1');
    h1.textContent = event.event_name;
    info.appendChild(h1);

    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = event.category_name || '';
    info.appendChild(chip);

    const org = document.createElement('p');
    org.className = 'info-line';
    org.innerHTML = '<strong>Hosted by:</strong> ' + escapeHtml(event.org_name);
    info.appendChild(org);

    const when = document.createElement('p');
    when.className = 'info-line';
    when.innerHTML = '<strong>When:</strong> ' + escapeHtml(formatDate(event.event_date)) +
                     (event.event_time ? ' at ' + escapeHtml(formatTime(event.event_time)) : '');
    info.appendChild(when);

    const where = document.createElement('p');
    where.className = 'info-line';
    where.innerHTML = '<strong>Where:</strong> ' + escapeHtml(event.location || '') +
                      (event.venue_address ? ' — ' + escapeHtml(event.venue_address) : '');
    info.appendChild(where);

    const price = document.createElement('p');
    price.className = 'info-line';
    price.innerHTML = '<strong>Ticket:</strong> <span class="price' + (Number(event.ticket_price) === 0 ? ' free' : '') + '">' +
                      escapeHtml(formatPrice(event.ticket_price)) + '</span>' +
                      (Number(event.ticket_price) === 0 ? ' (free event)' : '');
    info.appendChild(price);

    // --- Goal vs Progress ---
    const goalBox = document.createElement('div');
    goalBox.className = 'goal-box';
    const gTitle = document.createElement('h3');
    gTitle.textContent = 'Fundraising Goal';
    goalBox.appendChild(gTitle);

    const track = document.createElement('div');
    track.className = 'progress-track';
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    const goal = Number(event.goal_amount) || 0;
    const progress = Number(event.progress_amount) || 0;
    const pct = goal > 0 ? Math.min(100, Math.round((progress / goal) * 100)) : 0;
    fill.style.width = pct + '%';
    track.appendChild(fill);
    goalBox.appendChild(track);

    const caption = document.createElement('div');
    caption.className = 'goal-caption';
    caption.textContent = '$' + progress.toLocaleString('en-AU') + ' raised of $' +
                          goal.toLocaleString('en-AU') + ' goal (' + pct + '%)';
    goalBox.appendChild(caption);
    info.appendChild(goalBox);

    const regBtn = document.createElement('button');
    regBtn.id = 'register-btn';
    regBtn.className = 'btn';
    regBtn.textContent = 'Register for this Event';
    info.appendChild(regBtn);

    hero.appendChild(info);
    wrap.appendChild(hero);

    // --- Full description + organisation details ---
    const about = document.createElement('section');
    const aboutTitle = document.createElement('h2');
    aboutTitle.className = 'section-title';
    aboutTitle.textContent = 'About this event';
    about.appendChild(aboutTitle);
    const aboutP = document.createElement('p');
    aboutP.textContent = event.event_description || 'No description available.';
    about.appendChild(aboutP);

    const purpose = document.createElement('p');
    purpose.innerHTML = '<strong>Purpose:</strong> ' + escapeHtml(event.event_purpose || '');
    about.appendChild(purpose);
    wrap.appendChild(about);

    const orgBox = document.createElement('div');
    orgBox.className = 'contact-box';
    const orgTitle = document.createElement('h3');
    orgTitle.textContent = 'Organisation: ' + (event.org_name || '');
    orgBox.appendChild(orgTitle);
    const orgDesc = document.createElement('p');
    orgDesc.textContent = event.org_description || '';
    orgBox.appendChild(orgDesc);
    const orgContact = document.createElement('p');
    orgContact.innerHTML = (event.org_email ? 'Email: ' + escapeHtml(event.org_email) : '') +
                           (event.org_phone ? ' &nbsp;|&nbsp; Phone: ' + escapeHtml(event.org_phone) : '');
    orgBox.appendChild(orgContact);
    wrap.appendChild(orgBox);

    return wrap;
}

/**
 * Escape a string so it is safe to place inside innerHTML.
 */
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
