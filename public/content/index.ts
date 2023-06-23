let table: HTMLDivElement,
	newEmployeeForm: HTMLDivElement,
	leaveForm: HTMLDivElement,
	navbar: HTMLDivElement,
	profileView: HTMLDivElement,
	attendanceMarker: HTMLDivElement,
	attendanceLabel: HTMLDivElement,
	assigneeChanger: HTMLDivElement,
	modal: HTMLDivElement,
	boxTable: HTMLDivElement,
	calendar: HTMLDivElement;

let isHolidayInp: HTMLInputElement;
let reasonInp: HTMLInputElement, reasonLabel: HTMLLabelElement;
let isFulldayInp: HTMLInputElement, isFulldayLabel: HTMLLabelElement;
let mornoreveInps: HTMLInputElement[], mornoreveLabels: HTMLLabelElement[];
	
let persons: EmployeeProfile[];

interface MinimalHoliday {
	reason: string,
	morning: boolean,
	evening: boolean,
}

type Department = {
	name: string,
	_id: string,
}
type Post = {
	name: string,
	_id: string,
}


function showError(err?: string) {
	document.body.innerText = err || "Something went wrong. Please try again.";
}
function showForm(visible: boolean, form=newEmployeeForm) {
	form.style.display = visible?'block':'none';
}

function showModal(visible: boolean) {
	modal.style.display = visible?'flex':'none'
}

function getUnit() {
	const _body = document.querySelector('.body') as HTMLDivElement;
	return Math.max(Math.min(_body.clientHeight, _body.clientWidth)/40, 20)
}

function changeAssignee(leaveId: string, onAssigneeChange: (assigneeId: string) => void) {
	showModal(true);
	assigneeChanger.style.display = 'block';
	(<HTMLButtonElement> modal.querySelector('button.submit')).disabled = true;
	(<HTMLSelectElement> assigneeChanger.querySelector('select')).addEventListener('change', function(event) {
		(<HTMLButtonElement> modal.querySelector('button.submit')).disabled = !(<HTMLSelectElement> event.target).value;
	});
	(<HTMLButtonElement> modal.querySelector('button.submit')).onclick = () => {
		assigneeChanger.style.display = 'none'
		showModal(false)
		onAssigneeChange((<HTMLSelectElement> assigneeChanger.querySelector('select')).value)
	}
	(<HTMLButtonElement> modal.querySelector('button.cancel')).onclick = () => {
		assigneeChanger.style.display = 'none'
		showModal(false)
	}
}




/* TODO
function showAttendanceMarker(parts) {
	if(parts['0'] || parts['1']) {
		attendanceMarker.style.display = 'block'
		attendanceMarker.querySelector('input[name="first-half"]').disabled = !parts['0']
		attendanceMarker.querySelector('input[name="second-half"]').disabled = !parts['1']
	}
}*/


document.addEventListener('DOMContentLoaded', () => {
	table = <HTMLDivElement> document.getElementById('list')
	navbar = <HTMLDivElement> document.getElementById('nav-items')
	newEmployeeForm = <HTMLDivElement> document.getElementById('new-employee-form')
	leaveForm = <HTMLDivElement> document.getElementById('leave-form')
	profileView = <HTMLDivElement> document.getElementById('profile')
	attendanceMarker = <HTMLDivElement> document.getElementById('requestattendance')
	assigneeChanger = <HTMLDivElement> document.getElementById('assigneeChanger')
	modal = <HTMLDivElement> document.getElementById('modal')
	boxTable = <HTMLDivElement> document.getElementById('boxtable')
	
	authRoute()
	setupRouter();
})

function setupRouter() {
	if(!profile) return;
	const crntRoute = routes[location.pathname];
	for(let path in routes) {
		const route = routes[path]
		if(!route.isAuth
			|| route.hidden.superadmin && profile?.superadmin
			|| route.hidden.admin && !profile?.superadmin && profile?.admin
			|| route.hidden.employee===true && !profile?.superadmin && !profile?.admin
			|| typeof route.hidden.employee === 'object' && route.hidden.employee.office && !profile?.onsite && !profile.admin && !profile.superadmin
			|| typeof route.hidden.employee === 'object' && route.hidden.employee.onsite && profile?.onsite && !profile.admin && !profile.superadmin
		) {
			continue
		}
		const navItem = navbar.appendChild(document.createElement('div'));
		navItem.classList.add('nav-item')
		const navText = navItem.appendChild(document.createElement('div'))
		navText.classList.add('nav-item-text')
		navText.innerText = route.title;
		navItem.onclick = () => location.href = path;
		if(location.pathname === path) {
			navItem.classList.add('current')
			const svg = navItem.appendChild(document.createElement('svg'))
			svg.classList.add('nav-item-current-icon')
			svg.setAttribute('viewbox', "0 0 32 32")
			const circle = svg.appendChild(document.createElement('circle'))
			circle.setAttribute('cx', '16')
			circle.setAttribute('cy', '16')
			circle.setAttribute('r', '8')
			// navItem.appendChild('beforebegin', `<svg class="nav-item-current-icon" viewbox="0 0 32 32"><circle cx="16" cy="16" r="8"></circle></svg>`)
		}
		const sep = navbar.appendChild(document.createElement('div'));
		sep.classList.add('separator')
		//<div class="separator" data-usertype="common"></div>
	}
	const script = document.body.appendChild(document.createElement('script'))
	script.src = crntRoute.script
	if(crntRoute.otherscript) {
		const otherscript = document.body.appendChild(document.createElement('script'))
		otherscript.src = crntRoute.otherscript
	}
	initAttendance()
}

function editPersonForm(person: EmployeeProfile) {
	setupForm().then((form: HTMLFormElement) => {
		(<HTMLInputElement> form.querySelector('[name="name"]')).value = person.name
		form.email.value = person.email
		form.admin.checked = person.admin
		form.attendancereportingperson.disabled = person.admin
		form.leavereportingperson.disabled = person.admin
		form.leavereportingperson.value = person.leavereportingperson?._id || person.leavereportingperson || ''
		form.attendancereportingperson.value = person.attendancereportingperson?._id || person.attendancereportingperson || ''
		form.department.value = person.department?._id
		form.post.value = person.post?._id;
		(<HTMLButtonElement> form.querySelector('button')).innerText = "Edit Employee"
		form.data.editing = person._id;
		for(let i of form.attendancereportingperson.options)
			if(i.value===person._id) i.disabled = true
		for(let i of form.leavereportingperson.options)
			if(i.value===person._id) i.disabled = true
		//form.leavereportingperson.innerHTML += persons.filter(i => i._id!==profile._id).map(i => `<option value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`)
		//form.attendancereportingperson.innerHTML += persons.filter(i => i._id!==profile._id).map(i => `<option value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`)
	})
}

async function setupForm(): Promise<HTMLFormElement> {
	try {
		const form = newEmployeeForm.children[0] as HTMLFormElement
		// form.admin.onclick = () => {
		// 	form.leavereportingperson.disabled = form.admin.checked
		// 	form.attendancereportingperson.disabled = form.admin.checked
		// }
		if(form.department.options.length===1) {
			form.department.innerHTML += (await myfetch('departments/'))
				.data
				.map((i: Department) => `<option value="${i._id}">${i.name}</option>`)
				.join('')
		}
		if(form.post.options.length===1) {
			form.post.innerHTML += (await myfetch('posts/'))
				.data
				.map((i: Post) => `<option value="${i._id}">${i.name}</option>`)
				.join('')
		}
		if(form.leavereportingperson.options.length===1) {
			if(persons) {
				form.leavereportingperson.innerHTML += persons.map(i => `<option value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`)
				form.attendancereportingperson.innerHTML += persons.map(i => `<option value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`)
			} else {
				let reportingpersons = (await myfetch('persons/'))
				 	.data
				 	.map((i: EmployeeProfile) => `<option value="${i._id}">${i.name}</option>`)
					.join('')
				form.leavereportingperson.innerHTML += reportingpersons
				form.attendancereportingperson.innerHTML += reportingpersons
			}
		} else {
			for(let i of form.leavereportingperson.options) i.disabled = false;
			for(let i of form.attendancereportingperson.options) i.disabled = false;
		}
		return form;
	} catch (e) {
		console.error(e)
		showError()
		throw e;
	}
}


