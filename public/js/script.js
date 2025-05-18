
/*
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('featuredContainer');

    try {
        const res = await fetch('/api/listings/featured');
        const listings = await res.json();

        if (!listings.length) {
            container.innerHTML = '<p>No featured listings found.</p>';
            return;
        }

        listings.forEach(car => {
            const card = document.createElement('div');
            card.className = 'car-card';
            card.innerHTML = `
        <img src="${car.image_url}" alt="${car.brand_name} ${car.model_name}" width="250" height="150" />
        <h3>${car.brand_name} ${car.model_name}</h3>
        <p><strong>Year:</strong> ${car.year}</p>
        <p><strong>Price:</strong> ${car.price} UGX</p>
        <p><strong>Location:</strong> ${car.location}</p>
      `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading featured listings:', err);
        container.innerHTML = '<p>Error loading listings.</p>';
    }
});


 */
// test script

let featuredListings = [];
const container = document.getElementById('featuredContainer');

function renderFeatured(list) {
    container.innerHTML = ''; // clear old
    list.forEach(car => {
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
      <img src="${car.image_url}" alt="${car.brand_name} ${car.model_name}" width="200" height="auto" />
     <div class="car-info-wrapper">
          <h3 class="car-card-name">${car.brand_name} ${car.model_name}</h3>
          <p>Year: ${car.year} </p>
          <p>Price: ${car.price} UGX</p>
     </div>
     
    `;
        container.appendChild(card);
    });
}

function getRandomSubset(size = 20) {
    const shuffled = [...featuredListings].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
}

async function loadFeatured() {
    const res = await fetch('/api/listings/featured');
    featuredListings = await res.json();

    // initial render
    renderFeatured(getRandomSubset());

    // refresh every 15 seconds
    setInterval(() => {
        renderFeatured(getRandomSubset());
    }, 15000);
}

document.addEventListener('DOMContentLoaded', loadFeatured);
