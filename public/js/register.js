document.getElementById('registerForm').addEventListener('submit', async (e) => {
	e.preventDefault();
	const name = document.getElementById('name').value;
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	const res = await fetch('/api/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, email, password })
	});

	const data = await res.json();

	if (res.ok) {
		alert('Registration successful! Please login.');
		window.location.href = 'login.html';
	} else {
		alert(data.message);
	}
});
