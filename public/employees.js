function setupPage() {
	fetch('/api/persons/'+(profile.admin?'':'reporting'), {headers: {Authorization: 'Bearer '+auth}}).then(res => {
		if(res.status===200) {
			return res.json()
		} else {
			const err = new Error();
			err.status = res.status
			throw err;
		}
	}).then(res => {
		persons = res;
		fillTable('Employee List', [
			{name: 'Name', flex: 2.5},
			{name: 'Post'},
			{name: 'Department'},
			{name: 'Location'},
			{name: 'Privilage'},
			{name: 'Availability Today'},
		], res.map(i => [
			{title: i.name, flex: 2.5, onclick: 'showProfile(\'Person Profile\', \''+i._id+'\'); showTable(false);'},
			{title: i.post.name},
			{title: i.department.name},
			{title: i.onsite?'On-site':'Office'},
			{title: i.superadmin?'Super Admin':i.admin?'Admin':'Employee'},
			{title: i.admin?"-":i.available?!i.available[0] && i.available[1]?"After noon":i.available[1] && !i.available[0]?"Till noon":"Leave":"Full day"}
		]), profile.superadmin?addnew:null)
		showTable(true)
	}).catch(e => {
		if(e.status===405) {
			table.innerHTML = "No employees reporting under you."
			showTable(true)
		} else {
			console.log(e.status)
			document.body.innerHTML = "Some error occured. Try again later.";
			console.error(e);
		}
	})
}

function addnew() {
	showTable(false)
	showForm(true)
	setupForm().then(form => {
		form.name.value = ""
		form.email.value = ""
		form.admin.checked = false
		form.attendancereportingperson.disabled = false
		form.attendancereportingperson.value = ""
		form.leavereportingperson.disabled = false
		form.leavereportingperson.value = ""
		form.department.value = ""
		form.joiningdate.value = ""
		form.post.value = ""
		form.action = "/api/employees"
		form.method = "post"
		form.setAttribute('data-editing', '')
		form.querySelector('button').innerText = "Create Employee"
	})
}

function backFromForm() {
	showTable(true)
	showForm(false)
}

function onpersonclick(_id) {
	const person = persons.find(i => i._id===_id)
	showForm(true)
	showTable(false)
	editPersonForm(person)
	// fetch('/')
}

setupPage()

function newEmployee() {
	const form = newEmployeeForm.children[0]
	const editing = form.getAttribute('data-editing')
	let path = '/api/persons/', method
	if(editing) {
		path += editing
		method = 'PATCH'
	} else
		method = 'POST'
	const data = {
		name: form.name.value,
		email: form.email.value,
		department: form.department.value,
		post: form.post.value,
		admin: form.admin.checked,
		leavereportingperson: form.admin.checked?undefined:form.leavereportingperson.value,
		attendancereportingperson: form.admin.checked?undefined:form.attendancereportingperson.value,
		joiningdate: form.joiningdate.value,
		monthsprobation: parseInt(form.monthsprobation.value),
		onsite: form.onsite.checked
	}
	fetch(path, {
		method,
		headers: {Authorization: 'Bearer '+auth, 'Content-Type': 'application/json'},
		body: JSON.stringify(data),
	}).then(res => {
		if(res.status===201) {
			return res.json()
		} else {
			const err = new Error();
			err.status = res.status
			throw err;
		}
	}).then(res => {
		window.location.href = '/employees.html'
	}).catch(err => {
		console.error(err)
		console.log(err.status)
		document.innerHTML = 'Something went wrong. Please try again.'
	})
}

function backFromProfile() {
	showTable(true);
	hideProfile();
}
