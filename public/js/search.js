document.addEventListener('DOMContentLoaded', () => {
	const resultsContainer = document.getElementById('searchResults');
	const paginationContainer = document.getElementById('pagination');

	const query = new URLSearchParams(window.location.search);
	const page = parseInt(query.get('page')) || 1;
	query.set('page', page); // Always set page number

	const apiUrl = `/api/listings/search?${query.toString()}`;
	console.log('🔍 Requesting:', apiUrl);

	fetch(apiUrl)
		.then(res => {
			if (!res.ok) throw new Error('Failed to fetch');
			return res.json();
		})
		.then(res => {
			const listings = Array.isArray(res.data) ? res.data : [];
			const total = typeof res.total === 'number' ? res.total : 0;

			console.log('✅ Listings received:', listings.length, '| Total:', total);

			resultsContainer.innerHTML = '';
			paginationContainer.innerHTML = '';

			if (listings.length === 0) {
				resultsContainer.innerHTML = '<p>No listings found.</p>';
				return;
			}

			listings.forEach(listing => {
				const card = document.createElement('div');
				card.className = 'listing-card';

				card.innerHTML = `
          <img src="${listing.image_url}" alt="${listing.brand_name} ${listing.model_name}">
          <div class="listing-details">
            <h3>${listing.brand_name} ${listing.model_name} (${listing.year})</h3>
            <p>Fuel: ${listing.fuel_type || '—'} | Condition: ${listing.vehicle_condition || '—'}</p>
            <p>Location: ${listing.location}</p>
            <p><strong>${parseInt(listing.price).toLocaleString()} UGX</strong></p>
          </div>
        `;

				resultsContainer.appendChild(card);
			});

			renderPagination(total, page);
		})
		.catch(err => {
			console.error('❌ Search failed:', err);
			resultsContainer.innerHTML = '<p>Error loading search results.</p>';
		});

	function renderPagination(total, currentPage) {
		const limit = 25;
		const totalPages = Math.ceil(total / limit);
		if (totalPages <= 1) return;

		for (let i = 1; i <= totalPages; i++) {
			const btn = document.createElement('button');
			btn.textContent = i;
			if (i === currentPage) btn.classList.add('active');
			btn.addEventListener('click', () => {
				query.set('page', i);
				window.location.href = `/search.html?${query.toString()}`;
			});
			paginationContainer.appendChild(btn);
		}
	}
});
