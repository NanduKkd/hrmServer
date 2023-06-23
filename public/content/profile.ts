async function showProfile(title: string, person: string | EmployeeProfile, backable:boolean=true, editable=profile?.admin) {
	(<HTMLDivElement> profileView.querySelector('.title')).innerText = title
	let data: EmployeeProfile;
	const fields = (<NodeListOf<HTMLDivElement>> profileView.querySelectorAll('.field-value'))
	if(typeof person === 'string') {
		data = <EmployeeProfile> await myfetch('persons/'+person).then(res => res.data)
	} else data = person;
	profileView.dataset.person = data._id;
	fields[0].innerText = data.name;
	fields[1].innerText = data.superadmin?'Super Admin':data.admin?'Admin':'Employee'
	fields[2].innerText = data.post.name
	fields[3].innerText = data.department.name
	fields[4].innerText = data.onsite?'On-site':'Office'

	const d = new Date(data.joiningdate);
	const ld = new LeaveDate(d.getFullYear(), d.getMonth(), d.getDate(), true);
	fields[5].innerText = ld.dateFormat(true);

	fields[6].innerText = data.attendancereportingperson?.name || '-'
	fields[7].innerText = data.leavereportingperson?.name || '-';
	(<HTMLDivElement> fields[6].parentElement).dataset.person = data.leavereportingperson?._id || ''
	if(data.leavereportingperson) fields[6].classList.add('link')
	else fields[6].classList.remove('link');
	(<HTMLDivElement> fields[7].parentElement).dataset.person = data.attendancereportingperson?._id || ''
	if(data.attendancereportingperson) fields[7].classList.add('link')
	else fields[7].classList.remove('link')
	fields[8].innerText = data.email


	if(data.pml) {
		const pml = new PMLCalculator(data.pml);
		fields[9].innerText = pml.left('P/L')+''
		fields[10].innerText = pml.left('C/L')+''
		fields[11].innerText = pml.left('S/L')+''
		fields[12].innerText = pml.left('Compensatory')+''
	} else {
		fields[9].innerText = '-';
		fields[10].innerText = '-';
		fields[11].innerText = '-';
		fields[12].innerText = '-';
	}
	// fields[11].innerText = data.simpleReport?.lop?data.simpleReport.lop+' days':'-'
	/*
	fields[8].innerText = data.simpleReport?.leaves?data.simpleReport.leaves['P/L']+'':'-'
	fields[9].innerText = data.simpleReport?.leaves?data.simpleReport.leaves['C/L']+'':'-'
	fields[10].innerText = data.simpleReport?.leaves?data.simpleReport.leaves['S/L']+'':'-'
	fields[11].innerText = data.simpleReport?.lop?data.simpleReport.lop+' days':'-'
	*/
	if(editable) {
		// (<HTMLButtonElement> profileView.querySelector('button')).onclick = () => {editPersonForm(data);showForm(true); hideProfile()}
	}
	// (<HTMLDivElement> document.getElementById('attendanceDetails')).style.display = data.admin?'none':'block';
	(<HTMLDivElement> profileView.querySelector('.profile-back')).style.display = backable?'block':'none'
	profileView.style.display = 'block';
	(<HTMLButtonElement> profileView.querySelector('button')).style.display = editable?'block':'none'
}

function hideProfile() {
	profileView.style.display = 'none'
	showBoxTable(false)
}