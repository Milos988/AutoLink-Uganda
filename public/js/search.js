document.addEventListener('DOMContentLoaded', async () => {
	const container = document.getElementById('searchResults');
	const params = new URLSearchParams(window.location.search);

	try {
		const res = await fetch('/api/listings/search?' + params.toString());
		const data = await res.json();

		if (!data.length) {
			container.innerHTML = '<p>No results found.</p>';
			return;
		}

		data.forEach(listing => {
			const div = document.createElement('div');
			div.className = 'car-card';
			div.innerHTML = `
        <img src="${listing.image_url}" alt="${listing.brand_name} ${listing.model_name}" />
        <div class="info">
          <h3>${listing.brand_name} ${listing.model_name}</h3>
          <p><strong>Year:</strong> ${listing.year}</p>
          <p><strong>Price:</strong> ${listing.price}</p>
          <p><strong>Location:</strong> ${listing.location}</p>
        </div>
      `;
			container.appendChild(div);
		});
	} catch (err) {
		container.innerHTML = '<p>Error fetching results.</p>';
		console.error(err);
	}
});
