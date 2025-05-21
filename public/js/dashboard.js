document.addEventListener('DOMContentLoaded', () => {
	const dashboardContent = document.getElementById('dashboardContent');
	const dashboardBtn = document.getElementById('dashboardBtn');
	const addListingBtn = document.getElementById('addListingBtn');
	const myListingsBtn = document.getElementById('myListingsBtn');
	const logoutBtn = document.getElementById('logoutBtn');

	// Load profile once
	loadUserProfile();

	// Load dashboard view initially
	loadDashboard();

	// One-time event bindings
	dashboardBtn.addEventListener('click', () => {
		loadDashboard();
	});

	addListingBtn.addEventListener('click', () => {
		showAddListingForm();
	});

	myListingsBtn.addEventListener('click', () => {
		showMyListings();
	});

	logoutBtn.addEventListener('click', () => {
		fetch('/api/logout', { method: 'POST', credentials: 'include' }).then(() => {
			window.location.href = 'login.html';
		});
	});

	// Functions below 👇

	async function loadUserProfile() {
		const profileBox = document.querySelector('.profile');

		try {
			const res = await fetch('/api/profile', { credentials: 'include' });
			const data = await res.json();

			if (res.ok) {
				profileBox.innerHTML = `
					
					<h3>${data.name}</h3>
					<p>${mapUserRole(data.role)}</p>
					<p>Credits: ${data.credits}</p>
				`;
			} else {
				profileBox.innerHTML = `<h3>Unknown User</h3>`;
			}
		} catch (err) {
			console.error('Failed to load profile:', err);
		}
	}

	function mapUserRole(role) {
		switch (parseInt(role)) {
			case 1: return 'Private Seller';
			case 2: return 'Dealer/Importer';
			case 99: return 'Admin';
			default: return 'User';
		}
	}

	function loadDashboard() {
		dashboardContent.innerHTML = `
			<header class="dashboard-header">
				<h1>Dashboard Overview</h1>
			</header>
			<section class="stats-grid">
				<div class="stat-card"><h3>Cars</h3><p>12 Active</p><span>3 sold</span></div>
				<div class="stat-card"><h3>Bikes</h3><p>7 Active</p><span>1 sold</span></div>
				<div class="stat-card"><h3>Trucks</h3><p>4 Active</p><span>2 sold</span></div>
			</section>
			<section class="empty-state">
				<img src="/images/placeholder.jpg" alt="No Ads Illustration" />
				<h2>You haven't added any listings yet.</h2>
				<button id="startListingBtn">Add Your First Listing</button>
			</section>
		`;

		// Bind the button inside dynamic content
		const startListingBtn = document.getElementById('startListingBtn');
		if (startListingBtn) {
			startListingBtn.addEventListener('click', () => {
				showAddListingForm();
			});
		}
	}

	async function showAddListingForm() {
		dashboardContent.innerHTML = `
			<h2>Add New Listing</h2>
			<form id="listingForm" enctype="multipart/form-data">
				<select id="brand" name="brand_id" required><option value="">Select brand</option></select>
				<select id="model" name="model_id" required><option value="">Select model</option></select>
				<input type="text" id="year" name="year" placeholder="Year" required pattern="\\d{4}" />
				<input type="text" id="location" name="location" placeholder="Location" required />
				<select id="condition" name="vehicle_condition" required>
					<option value="">Select Condition</option>
					<option value="new">New</option>
					<option value="used">Used</option>
				</select>
				<input type="text" id="price" name="price" placeholder="Price (UGX)" required />
				<input type="file" id="image" name="image" accept="image/*" required />
				<button type="submit">Submit Listing</button>
			</form>
			<p id="creditMessage" style="color:red;font-weight:bold;"></p>
		`;

		const brandSelect = document.getElementById('brand');
		const modelSelect = document.getElementById('model');

		// Load brands
		try {
			const brandRes = await fetch('/api/brands');
			const brands = await brandRes.json();

			brands.forEach(b => {
				const opt = document.createElement('option');
				opt.value = b.id;
				opt.textContent = b.name;
				brandSelect.appendChild(opt);
			});
		} catch (err) {
			console.error('Error loading brands:', err);
		}

		// Handle brand change to load models
		brandSelect.addEventListener('change', () => {
			const brandId = brandSelect.value;
			modelSelect.innerHTML = '<option value="">Select model</option>';
			if (!brandId) return;

			fetch(`/api/brands/models?brand_id=${brandId}`)
				.then(res => res.json())
				.then(models => {
					models.forEach(m => {
						const opt = document.createElement('option');
						opt.value = m.id;
						opt.textContent = m.name;
						modelSelect.appendChild(opt);
					});
				})
				.catch(err => console.error('Error loading models:', err));
		});

		// Check user credits
		const user = JSON.parse(localStorage.getItem('user'));
		try {
			const creditsRes = await fetch(`/api/users/${user.id}/credits`, {
				headers: { Authorization: `Bearer ${user.token}` }
			});
			const creditsData = await creditsRes.json();

			if (creditsData.credits <= 0) {
				document.getElementById('creditMessage').textContent = "You need to buy credits before adding a listing.";
				document.getElementById('listingForm').querySelector('button').disabled = true;
			}
		} catch (err) {
			console.error('Error checking user credits:', err.message);
		}

		// Handle form submit
		document.getElementById('listingForm').addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(e.target);

			try {
				const res = await fetch('/api/listings', {
					method: 'POST',
					credentials: 'include',
					body: formData
				});
				const result = await res.json();

				if (res.ok) {
					alert('Listing added!');
					loadUserProfile();
					loadDashboard();
				} else {
					alert(result.message || 'Failed to add listing.');
				}
			} catch (err) {
				console.error('Error submitting listing:', err.message);
			}
		});
	}

	function showMyListings() {
		dashboardContent.innerHTML = `
			<h2>My Listings</h2>
			<table>
				<thead>
					<tr><th>Title</th><th>Category</th><th>Location</th><th>Price</th><th>Boost</th></tr>
				</thead>
				<tbody>
					<tr><td>Toyota Premio</td><td>Car</td><td>Kampala</td><td>32,000,000 UGX</td><td><button>Boost</button></td></tr>
					<tr><td>Yamaha XTZ</td><td>Bike</td><td>Gulu</td><td>6,500,000 UGX</td><td><button>Boost</button></td></tr>
				</tbody>
			</table>
		`;
	}
});
