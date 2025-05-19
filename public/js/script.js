document.addEventListener('DOMContentLoaded', () => {
    const brandSelect = document.getElementById('brand');
    const modelSelect = document.getElementById('model');
    const searchForm = document.getElementById('searchForm');
    const featuredContainer = document.getElementById('featuredContainer');

    // 🔹 Load brands
    fetch('/api/brands')
        .then(res => res.json())
        .then(data => {
            data.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand.id;
                option.textContent = brand.name;
                brandSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Error loading brands:', err);
        });

    // 🔹 Load models when brand is selected
    brandSelect.addEventListener('change', (e) => {
        const brandId = parseInt(e.target.value);
        modelSelect.innerHTML = '<option value="">All Models</option>';

        if (!brandId || isNaN(brandId)) return;

        fetch(`/api/models?brand=${brandId}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch models');
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data)) throw new Error('Expected model list');
                data.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.name;
                    modelSelect.appendChild(option);
                });
            })
            .catch(err => {
                console.error('Error loading models:', err.message);
            });
    });

    // 🔹 Search form submit
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const query = new URLSearchParams(formData).toString();
        window.location.href = `/search.html?${query}`;
    });

    // 🔹 Featured listings
    let featuredListings = [];

    function renderFeatured(list) {
        featuredContainer.innerHTML = '';
        list.forEach(car => {
            const card = document.createElement('div');
            card.className = 'car-card';
            card.innerHTML = `
        <img src="${car.image_url}" alt="${car.brand_name} ${car.model_name}" width="200" height="auto" />
        <div class="car-info-wrapper">
          <h3 class="car-card-name">${car.brand_name} ${car.model_name}</h3>
          <p>Year: ${car.year}</p>
          <p>Price: ${parseInt(car.price).toLocaleString()} UGX</p>
        </div>
      `;
            featuredContainer.appendChild(card);
        });
    }

    function getRandomSubset(size = 20) {
        const shuffled = [...featuredListings].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, size);
    }

    async function loadFeatured() {
        try {
            const res = await fetch('/api/listings/featured');
            featuredListings = await res.json();

            if (!Array.isArray(featuredListings) || featuredListings.length === 0) {
                featuredContainer.innerHTML = '<p>No featured listings available.</p>';
                return;
            }

            renderFeatured(getRandomSubset());
            setInterval(() => {
                renderFeatured(getRandomSubset());
            }, 15000);
        } catch (err) {
            console.error('Error loading featured listings:', err);
            featuredContainer.innerHTML = '<p>Error loading listings.</p>';
        }
    }

    loadFeatured();
});
