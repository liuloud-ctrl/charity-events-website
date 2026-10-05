// =============================================================================
// search.js - Search page logic.
//  - Populates the category dropdown from GET /api/categories
//  - Submits the form and calls GET /api/events/search with the chosen criteria
//  - "Clear Filters" resets the whole form (DOM manipulation)
//  - Displays results or an error message via DOM
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const dateInput = document.getElementById('f-date');
    const locInput = document.getElementById('f-location');
    const catSelect = document.getElementById('f-category');
    const clearBtn = document.getElementById('clear-btn');
    const errorMsg = document.getElementById('error-msg');
    const loading = document.getElementById('loading');
    const resultsTitle = document.getElementById('results-title');
    const noResults = document.getElementById('no-results');
    const resultsGrid = document.getElementById('results-grid');

    // --- 1. Populate the category filter from the API ---
    apiGet('/api/categories')
        .then((categories) => {
            categories.forEach((cat) => {
                const opt = document.createElement('option');
                opt.value = cat.category_id;
                opt.textContent = cat.category_name;
                catSelect.appendChild(opt);
            });
        })
        .catch(() => {
            // Categories are optional for a basic search; just ignore.
            console.error('Could not load categories.');
        });

    // --- 2. Handle the search submission ---
    form.addEventListener('submit', (event) => {
        event.preventDefault();                    // stop the page from reloading

        // Collect the criteria the user selected (empty strings are ignored).
        const params = new URLSearchParams();
        if (dateInput.value)      params.set('date', dateInput.value);
        if (locInput.value.trim()) params.set('location', locInput.value.trim());
        if (catSelect.value)      params.set('category', catSelect.value);

        // Show the loading state and hide previous results / errors.
        loading.hidden = false;
        noResults.hidden = true;
        errorMsg.classList.remove('visible');
        resultsTitle.hidden = true;
        resultsGrid.innerHTML = '';

        apiGet('/api/events/search?' + params.toString())
            .then((results) => {
                loading.hidden = true;
                resultsTitle.hidden = false;

                if (!results || results.length === 0) {
                    noResults.hidden = false;
                    return;
                }
                results.forEach((event) => {
                    resultsGrid.appendChild(buildEventCard(event));
                });
            })
            .catch((err) => {
                loading.hidden = true;
                errorMsg.textContent = 'Search failed: ' + err.message;
                errorMsg.classList.add('visible');
            });
    });

    // --- 3. "Clear Filters" resets the form and the results (DOM manipulation) ---
    clearBtn.addEventListener('click', () => {
        form.reset();                       // reset all input controls
        resultsGrid.innerHTML = '';         // clear the results grid
        resultsTitle.hidden = true;
        noResults.hidden = true;
        errorMsg.classList.remove('visible');
    });
});
