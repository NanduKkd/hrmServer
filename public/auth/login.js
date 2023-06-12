let emailInp, passwordInp, loginBtn;
document.addEventListener('DOMContentLoaded', () => {
	authRoute()
	emailInp = document.querySelector('input[name="email"]')
	passwordInp = document.querySelector('input[name="password"]')
	loginBtn = document.querySelector('button');
})

function login() {
	if(!emailInp.value || !passwordInp.value) alert("Please fill all fields")
	else {
		fetch('/api/auth/', {headers: {Authorization: 'Basic '+btoa(emailInp.value+':'+passwordInp.value)}})
			.then(r => {
				console.log(r.status)
				if(r.status>=400) {
					emailInp.disabled = false;
					passwordInp.disabled = false
					loginBtn.disabled = false
					const e = new Error("Incorrect email or password.")
					e.status = r.status
					throw e;
				} else {
					return r.json()
				}
			})
			.then(r => {
				localStorage.setItem('profile', JSON.stringify(r.profile))
				localStorage.setItem('auth', r.token)
				authRoute(false, false)
			})
			.catch(e => {
				console.error(e)
				emailInp.disabled = false;
				passwordInp.disabled = false
				loginBtn.disabled = false
				alert(e.status===400?e.message:"Something went wrong. Try again.")
			})
		emailInp.disabled = true
		passwordInp.disabled = true
		loginBtn.disabled = true
	}
}
