let departments, posts;
let table2

function setupPage() {
	fetch('/api/departments', {headers: {Authorization: 'Bearer '+auth}}).then(res => {
		if(res.status===200) {
			return res.json()
		} else {
			const err = new Error();
			err.status = res.status
			throw err;
		}
	}).then(res => {
		departments = res;
		fillTable("Departments", [
			{name: 'Name'},
		], res.map(i => [
			{title: i.name},
		]), newDepartment)
		showTable(true)
	}).catch(e => {
		console.log(e.status)
		document.body.innerHTML = "Some error occured. Try again later.";
		console.error(e);
	})
	table.insertAdjacentHTML('afterend', `<div id="table2" class="list">${table.innerHTML}</div>`)
	table2 = document.getElementById('table2')
	fetch('/api/posts', {headers: {Authorization: 'Bearer '+auth}}).then(res => {
		if(res.status===200) {
			return res.json()
		} else {
			const err = new Error();
			err.status = res.status
			throw err;
		}
	}).then(res => {
		posts = res;
		fillTable("Posts", [
			{name: 'Name'},
		], res.map(i => [
			{title: i.name},
		]), newPost, table2)
		showTable(true, table2)
	}).catch(e => {
		console.log(e.status)
		document.body.innerHTML = "Some error occured. Try again later.";
		console.error(e);
	})
}

setupPage()

function newDepartment() {
	const name = window.prompt('Name for new department:')
	if(!name) return;
	fetch('/api/departments', {
		method: 'POST',
		headers: {'Content-Type': 'application/json', Authorization: 'Bearer '+auth},
		body: JSON.stringify({name})
	}).then(res => {
		if(res.status===201) {
			return res.json()
		} else {
			const err = new Error();
			err.status = res.status
			throw err;
		}
	}).then(res => {
		console.log(res)
		appendTable([[{title: res.name}]])
	}).catch(e => {
		console.log(e.status)
		document.body.innerHTML = "Some error occured. Try again later.";
		console.error(e)
	})
}

function newPost() {
	const name = window.prompt('Name for new post:')
	if(!name) return;
	fetch('/api/posts', {
		method: 'POST',
		headers: {'Content-Type': 'application/json', Authorization: 'Bearer '+auth},
		body: JSON.stringify({name})
	}).then(res => {
		if(res.status===201) {
			return res.json()
		} else {
			const err = new Error();
			err.status = res.status
			throw err;
		}
	}).then(res => {
		console.log(res)
		appendTable([[{title: res.name}]], table2)
	}).catch(e => {
		console.log(e.status)
		document.body.innerHTML = "Some error occured. Try again later.";
		console.error(e)
	})
}
