let table2;
function reject(target, _id) {
	target.disabled = true;
	target.previousElementSibling.disabled = true
	myfetch('/leaves/respond/leave/'+_id+'/'+'Rejected', {method: 'PATCH'}).then(() => {
		location.reload()
	}).catch(err => {
		target.disabled = false;
		target.previousElementSibling.disabled = false
		alert("Something went wrong. Please try again later.")
		console.error(err)
	})
}
function accept(target, _id) {
	target.disabled = true;
	target.nextElementSibling.disabled = true
	myfetch('/leaves/respond/leave/'+_id+'/'+'Accepted', {method: 'PATCH',}).then(r => {
		location.reload();
		// console.log(r)
		// alert('done');
	}).catch(err => {
		target.disabled = false;
		target.nextElementSibling.disabled = false;
		console.error(err)
	})
}
function startPage() {
	document.querySelector('.body').innerHTML += `<div class="list" id="table2">${table.innerHTML}</div>`
	table2 = document.getElementById('table2')
	table = document.getElementById('list')
	// authRoute(true, 'common')
	fetch('/api/leaves/requestedleaves', {headers: {Authorization: 'Bearer '+auth}})
		.then(res => {
			if(res.status>=400) {
				const err = new Error('Response Status Code '+res.status)
				err.status = res.status
				throw err
			} else {
				return res.json();
			}
		})
		.then(res => {
			fillTable('Leave Requests', [
				{name: 'Employee', flex: 3},
				{name: 'From'},
				{name: 'To'},
				{name: 'Length'},
				{name: 'Type'},
				{name: 'Actions'},
			], res.map(i => [
				{title: i.name, subtitle: i.department+', '+i.post, flex: 3, onclick: `showTable(false); showProfile('Person Profile', '${i.pid}');`},
				{title: LeaveDate.fromString(i.period.from).dateFormat(), subtitle: LeaveDate.fromString(i.period.from).timeFormat()},
				{title: LeaveDate.fromString(i.period.to).dateFormat(), subtitle: LeaveDate.fromString(i.period.to).timeFormat(true)},
				{title: i.period.length+' days'},
				{title: i.type},
				{type: 'html', html: `
					<div class="list-item-column">
						<button onclick="accept(this, '${i._id}')" class="accept">Accept</button>
						<button onclick="reject(this, '${i._id}')" class="reject">Reject</button>
					</div>`
				}
			]), undefined, table2)
			showTable(true, table2)
		})
		.catch(e => {
			if(e.status===405) {
				table2.innerHTML = "<div style=''>No employees reporting under you.</div>"
				showTable(true, table2)
			} else {
				console.log(e.status)
				document.body.innerHTML = "Some error occured. Try again later.";
				console.error(e);
			}
		})
	;
	fetch('/api/leaves/sub', {headers: {Authorization: 'Bearer '+auth}}).then(res => {
		if(res.status>=400) {
			console.log(res.status)
			throw new Error()
		} else return res.json()
	}).then((res) => {
		
		fillTable('Work assigning requests for you', [
			{name: 'Employee'},
			{name: 'From'},
			{name: 'To'},
			{name: 'Period Length'},
			{name: "Action"},
		], res.leaves.map(i => [
			{title: i.employee, subtitle: i.post+', '+i.department},
			{title: LeaveDate.fromString(i.period.from).dateFormat(), subtitle: LeaveDate.fromString(i.period.from).timeFormat()},
			{title: LeaveDate.fromString(i.period.to).dateFormat(), subtitle: LeaveDate.fromString(i.period.to).timeFormat(true)},
			{title: i.period.length+' days'},
			{type: 'html', html: `
				<div class="list-item-column">
					<button onclick="respondSub('${i._id}', true)" class="accept">Accept</button>
					<button onclick="respondSub('${i._id}', false)" class="reject">Reject</button>
				</div>
			`},
		]))
		if(res.leaves.length)
			showTable(true)
	}).catch(e => {
		console.error(e)
		document.body.innerHTML = "Something went wrong. Pleasde try again later."
	})
}

startPage()

function respondSub(id, response) {
	fetch('/api/leaves/sub/newrequest/'+id, {
		method: 'PATCH',
		headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer '+auth},
		body: JSON.stringify({status: response?'Accepted':'Rejected'}),
	}).then(res => {
		if(res.status===204) {
			// console.log('hehahjhsdf')
			location.reload()
		} else {
			console.log(res.status)
			throw new Error()
		}
	}).catch(e => {
		console.error(e)
		document.body.innerHTML = 'Something went wrong. Please try again.'
	})
}

function backFromForm() {
	showForm(false)
	showTable(true)
}
function backFromProfile() {
	hideProfile()
	showTable(true)
}
