let perRepYearInp: HTMLSelectElement,
	perRepMonthInp: HTMLSelectElement,
	perRepContainer: HTMLDivElement,
	perRepSubmit: HTMLButtonElement,
	perRepTitle: HTMLHeadingElement,
	// myLimits: {from: number, to: number},
	perRepYear: number, perRepMonth: number, person: string | null,
	attendanceTable: HTMLTableElement;

let totRepYearInp: HTMLSelectElement,
	totRepMonthInp: HTMLSelectElement,
	totRepContainer: HTMLDivElement,
	totRepSubmit: HTMLButtonElement,
	reportTable: HTMLTableSectionElement,
	totRepYear: number, totRepMonth: number;

function personalReportSetup() {
	const now = new Date()
	// let changed = false;
	// year=parseInt(url.searchParams.get('year') || '');
	// month=parseInt(url.searchParams.get('month') || '');
	// if(!year || isNaN(year) || !month || isNaN(month)) {
	// 	year = now.getFullYear();
	// 	month = now.getMonth();
	// 	changed = true;
	// }
	// if(person && !profile?.admin) {
	// 	url.searchParams.delete('person');
	// 	person = null;
	// 	changed = true;
	// }
	// if(changed) {
	// 	url.searchParams.set('year', year+'')
	// 	url.searchParams.set('month', month+'')
	// 	history.pushState(null, '', url.toString())
	// }
	
	perRepContainer = document.getElementById('personalReport') as HTMLDivElement;
	perRepTitle = perRepContainer.querySelector('h3') as HTMLHeadingElement;
	perRepYearInp = perRepContainer.querySelector('select[data-key="year"]') as HTMLSelectElement;
	perRepMonthInp = perRepContainer.querySelector('select[data-key="month"]') as HTMLSelectElement;
	perRepSubmit = perRepContainer.querySelector('button') as HTMLButtonElement;
	
	perRepYearInp.addEventListener('change', () => {
		perRepYear = parseInt(perRepYearInp.value)
		// if(myLimits.from>year*12 || year*12+11>myLimits.to) {
		// 	if(month+year*12>myLimits.to || month+year*12<myLimits.from) {
		// 		perRepMonthInp.value = '';
		// 	}
		// 	// for(let i of (perRepMonthInp.children as HTMLOptionsCollection)) {
		// 	// 	if(i.value && parseInt(i.value)+year*12<myLimits.from || parseInt(i.value)+year*12>myLimits.to) {
		// 	// 		i.disabled = true;
		// 	// 	}
		// 	// }
		// }
		perRepSubmit.disabled = false;
	})
	perRepMonth = now.getMonth();
	perRepYear = now.getFullYear();
	const yNodes = [now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1].map(i => {
		const e = document.createElement('option');
		e.innerText = i+'';
		e.value = i+'';
		return e;
	})
	perRepYearInp.append(...yNodes)
	perRepYearInp.value = perRepYear+'';


	perRepMonthInp.addEventListener('change', () => {
		perRepMonth = parseInt(perRepMonthInp.value)
		perRepSubmit.disabled = false;
	})
	const mNodes = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((i,ii) => {
		const e = document.createElement('option');
		e.value = ii+'';
		e.innerText = i;
		return e;
	})
	perRepMonthInp.append(...mNodes);
	perRepMonthInp.value = perRepMonth+'';

	perRepSubmit.addEventListener('click', () => loadPersonalReport(perRepContainer.dataset.person || ''))

	attendanceTable = perRepContainer.querySelector('table') as HTMLTableElement;

	// fetch('/api/attendance/totalreport/'+now.getFullYear()+'/'+((now.getMonth()+1)+'').padStart(2,'0'), {
	// 	headers: {Authorization: 'Bearer '+auth}
	// }).then(res => {
	// 	if(res.status===200) return res.json()
	// 	else {
	// 		const e = new Error()
	// 		e.status = res.status
	// 		throw e;
	// 	}
	// }).then(res => {
	// 	console.log(res)
	// 	fillBoxTable('Employees Attendance Report ('+now.getFullYear()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]+')', [
	// 		{label: "Employee"},
	// 		{label: "Attendance"},
	// 		{label: "P/L"},
	// 		{label: "C/L"},
	// 		{label: "S/L"},
	// 		{label: "LoP"},
	// 	], res.map((i) => [
	// 		{label: i.employee.name},
	// 		{label: i.data.attendance},
	// 		{label: i.data.leaves['P/L']},
	// 		{label: i.data.leaves['C/L']},
	// 		{label: i.data.leaves['S/L']},
	// 		{label: i.data.lop},
	// 	]))
	// 	showBoxTable(true)
	// }).catch(e => {
	// 	if(e.status===400) showBoxTable(false)
	// 	else
	// 	document.body.innerHTML = "Something went wrong. Please try again."
	// })
}

personalReportSetup()

async function loadPersonalReport(person: string) {
	perRepContainer.dataset.person = person;
	perRepSubmit.disabled = true;
	const {data} = await myfetch(`reports/personal/${profile?.admin && person?person:'self'}/${perRepYear}/${perRepMonth+1}`)
	const tbody = attendanceTable.querySelector('tbody') as HTMLTableSectionElement;
	if(profile?.admin && person) {
		perRepTitle.innerText = data.person.name+"'s personal attendance report"
	} else {
		perRepTitle.innerText = "Your personal attendance report"
	}
	tbody.innerHTML = '';
	for(let i of data.attendances) {
		const row = tbody.appendChild(document.createElement('tr'));
		const rh = row.appendChild(document.createElement('th'));
		rh.innerText = i.date;
		const rmorn = row.appendChild(document.createElement('td'));
		rmorn.innerText = i.morningText;
		rmorn.className = i.morningStatus;
		const reve = row.appendChild(document.createElement('td'));
		reve.innerText = i.eveningText;
		reve.className = i.eveningStatus;
	}
}

function totalReportSetup() {
	const now = new Date()
	totRepContainer = document.getElementById('totalReport') as HTMLDivElement;
	totRepYearInp = totRepContainer.querySelector('select[data-key="year"]') as HTMLSelectElement;
	totRepMonthInp = totRepContainer.querySelector('select[data-key="month"]') as HTMLSelectElement;
	totRepSubmit = totRepContainer.querySelector('button') as HTMLButtonElement;

	totRepYearInp.addEventListener('change', () => {
		totRepYear = parseInt(totRepYearInp.value)
		totRepSubmit.disabled = false;
	})
	totRepMonth = now.getMonth();
	totRepYear = now.getFullYear();
	const yNodes = [now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1].map(i => {
		const e = document.createElement('option');
		e.innerText = i+'';
		e.value = i+'';
		return e;
	})
	totRepYearInp.append(...yNodes)
	totRepYearInp.value = totRepYear+'';


	totRepMonthInp.addEventListener('change', () => {
		totRepMonth = parseInt(totRepMonthInp.value)
		totRepSubmit.disabled = false;
	})
	const mNodes = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((i,ii) => {
		const e = document.createElement('option');
		e.value = ii+'';
		e.innerText = i;
		return e;
	})
	totRepMonthInp.append(...mNodes);
	totRepMonthInp.value = totRepMonth+'';

	totRepSubmit.addEventListener('click', () => loadTotalReport())

	reportTable = totRepContainer.querySelector('tbody') as HTMLTableSectionElement;

}

totalReportSetup()
showPersonReport(false);

async function loadTotalReport() {
	totRepSubmit.disabled = true;
	const {data} = await myfetch(`reports/total/${totRepYear}/${totRepMonth+1}`)
	reportTable.innerHTML = '';
	for(let i of data) {
		const row = reportTable.appendChild(document.createElement('tr'));
		const rh = row.appendChild(document.createElement('th'));
		rh.innerText = i.person;
		rh.classList.add('link')
		rh.onclick = () => showPersonReport(i.pid)
		const pml = new PMLCalculator(i);
		const cys = pml.nextMonthCarrys();
		[
			pml.pml.carryPL+pml.pml.earnedPL,
			pml.pml.carryCL+pml.pml.earnedCL,
			pml.pml.carrySL+pml.pml.earnedSL,
			pml.pml.carryCompensatory,
			pml.pml.takenPL,
			pml.pml.takenCL,
			pml.pml.takenSL,
			pml.pml.earnedCompensatory,
			pml.pml.redmark,
			cys.carryPL,
			cys.carryCL,
			cys.carrySL,
			cys.carryCompensatory,
			pml.lop()
		].forEach(j => {
			const td = row.appendChild(document.createElement('td'));
			if(!j) td.classList.add('empty-box')
			td.innerText = j+'';
		})
	}
}

function showPersonReport(person: string | false) {
	perRepContainer.style.display = person?'block':'none'
	totRepContainer.style.display = person?'none':'block'
	if(person) loadPersonalReport(person);
	else loadTotalReport();
}
	


