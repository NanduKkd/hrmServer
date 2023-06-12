document.addEventListener('DOMContentLoaded', () => {
	// Try let post = JSON.parse(localStorage.getItem('auth') || '{"admin": false}').post
	localStorage.removeItem('auth')
	localStorage.removeItem('profile')
	authRoute();
})
