function getRoleName(roleId) {
	switch (roleId) {
		case 0: return 'Admin';
		case 1: return 'Seller (Basic)';
		case 2: return 'Seller (Pro)';
		default: return 'Unknown';
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	try {
		const res = await fetch('/api/profile', {
			credentials: 'include'
		});

		if (!res.ok) throw new Error('Unauthorized');

		const user = await res.json();

		document.getElementById('welcome').textContent = `Welcome, ${user.name}`;
		document.getElementById('role').textContent = `Role: ${getRoleName(user.role)}`;
		document.getElementById('credits').textContent = `Credits: ${user.credits}`;
	} catch (err) {
		alert('Session expired or invalid token.');
		window.location.href = 'login.html';
	}
});
document.getElementById('logoutBtn').addEventListener('click', async () => {
	await fetch('/api/logout', { method: 'POST', credentials: 'include' });
	window.location.href = 'login.html';
});
