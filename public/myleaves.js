// let holidays = []
// let leavesLeft;
let today;


// function calculateMonthCarry(lastpml, thismy) {
// 	const carrys = {}
// 	if(thismy%12===0) {
// 		carrys.carrySL = 0
// 		carrys.carryCompensatory = 0
// 		carrys.carryCL = 0
// 		carrys.carryPL = Math.max(lastpml.earnedPL+lastpml.carryPL-lastpml.takenPL, 0)%PLPerYear;
// 	} else {
// 		carrys.carrySL = Math.max(lastpml.carrySL + lastpml.earnedSL - lastpml.takenSL, 0)
// 		carrys.carryCompensatory = Math.max(lastpml.carryCompensatory + lastpml.earnedCompensatory - lastpml.takenCL, 0)
// 		carrys.carryCL = Math.max(
// 			lastpml.carryCompensatory + lastpml.earnedCompensatory < lastpml.takenCL
// 				? lastpml.carryCompensatory + lastpml.earnedCompensatory - lastpml.takenCL + lastpml.carryCL + lastpml.earnedCL
// 				: lastpml.carryCL + lastpml.earnedCL,
// 			0
// 		)
// 		carrys.carryPL = Math.max(lastpml.carryPL + lastpml.earnedPL - lastpml.takenPL);
// 	}
// 	return carrys;
// }

function setupPage() {
	const td = new Date()
	today = new Date(`${td.getFullYear()}-${td.getMonth()+1}-${td.getDate()}Z`).getTime()/(3600000*24)
	myfetch('leaves/myleaves').then(res => {
		fillTable('Your leave requests', [
			{name: 'From'},
			{name: 'To'},
			{name: 'Length'},
			{name: 'Type'},
			{name: 'Status'},
		], res.data.map(i => [
			{title: LeaveDate.fromString(i.period.from).dateFormat(), subtitle: LeaveDate.fromString(i.period.from).timeFormat()},
			{title: LeaveDate.fromString(i.period.to).dateFormat(), subtitle: LeaveDate.fromString(i.period.to).timeFormat(true)},
			{title: i.period.length+' days'},
			{title: i.type},
			i.sub?.person && i.sub.status==='Rejected'?{
				title: 'Rejected by Assignee', onclick: 'formAssigneeChanger(\''+i._id+'\')'
			}:{title: i.sub?.person && i.sub.status!=='Accepted'?(
					i.sub.status==='Waiting'?'Waiting for Assignee Response'
					:'Rejected by Assignee'
				):(
					i.status==='Waiting'?'Pending'
					:i.status==='Rejected'?'Rejected'
					:'Accepted'
				),
			}
		]), addNew)
		// res.data.forEach(i => {
		// 	if(i.status!=='Rejected') {
		// 		leavesLeft[i.type].left -= i.period.length
		// 	}
		// })
		showTable(true)
		//addNew()
	})
	myfetch('persons').then(res => {
		persons = res.data;
		leaveForm.children[0].sub.insertAdjacentHTML('beforeend', persons.map(i => `<option${i._id===profile._id?" disabled":""} value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`).join(''))
		assigneeChanger.querySelector('select[name="assignee"]').innerHTML += persons.map(i => `<option${i._id===profile._id?" disabled":""} value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`).join('')
	})


	// const form = leaveForm.children[0];
	// form['type'].onchange = (e) => {
	// 	form.querySelector('[name="from"]').dataset.minDate = e.target.value==='S/L'?today:e.target.value==='C/L'?today+7:e.target.value==='P/L'?today+30:today
	// 	form.assigned.disabled = e.target.value!=='P/L'
	// 	//fillCalendar(form.querySelector('[name="from"]'), undefined, undefined, form.querySelector('[name="from"]').dataset.minDate)
	// 	const now = new Date();
	// 	for(let i of pmls) {
	// 		const option = document.createElement('option')
	// 		option.value = i+1;
	// 		option.innerHTML = i+1;
	// 		leaveForm.children[0]['from-month'].append(option)
	// 	}
	// 	form['from-full-day']['0'].checked = false;
	// 	form['from-full-day']['1'].checked = false;
	// 	fillCalendar(form.querySelector('[name="to"]'))
	// 	form['to-full-day']['0'].checked = false;
	// 	form['to-full-day']['1'].checked = false;
	// 	dateChange()
	// }
	/*
	 form.querySelector('[name="from"]').onchange = () => {
		form['from-full-day']['0'].checked = false;
		form['from-full-day']['1'].checked = false;
		fillCalendar(form.querySelector('[name="to"]'))
		form['to-full-day']['0'].checked = false;
		form['to-full-day']['1'].checked = false;
		dateChange()
	}
	*/
	// form['from-full-day']['0'].onclick = form['from-full-day']['1'].onclick = () => {
	// 	const fromSet = form.querySelector('[name="from"]').dataset
	// 	const fromDate = new Date(`${fromSet.value}Z`).getTime()/3600000/24 + (form['from-full-day'].value==='1'?0:0.5)
	// 	const type = form['type'].value
	// 	let endDate;

	// 	const frommy = fromDate.getFullYear()*12+fromDate.getMonth();
	// 	let i=frommy, lleft;
	// 	const _npmy = leavesleft[fromDate.getFullYear()+'-'+toDate.getMonth()]
	// 	let pml = {
	// 		earnedCL: _npmy.carryCL,
	// 		earnedPL: _npmy.carryPL,
	// 		earnedSL: _npmy.carrySL,
	// 		earnedCompensatory: _npmy.carryCompensatory,
	// 		carryCL: 0, carrySL: 0, carryPL: 0, carryCompensatory: 0,
	// 		earnedCL: 0, earnedSL: 0, earnedPL: 0,
	// 	}
	// 	/*
	// 	while(true) {
	// 		const len = new Date(new Date(
	// 			Math.floor((i+1)/12),
	// 			(i+1)%12,
	// 			1
	// 		).getTime()-24*3600*1000).getDate() + (i===frommy?-fromDate.getDate() + (form['from-full-day'].value==='1'?1:0.5):0);
	// 		let carrys = calculateMonthCarry(pml, i);
	// 		let takens = {};
	// 		if(leave.type==='S/L') takens.takenSL = len;
	// 		else if(leave.type==='C/L') takens.takenCL = len;
	// 		else if(leave.type==='P/L') takens.takenPL = len;
	// 			pml = {...leavesLeft[Math.floor(i/12)+'-'(i%12)]}//await pmlModel.findOne({person: leave.pid, month: i%12, year: Math.floor(i/12)})
	// 			for(let j in carrys) pml[j] = carrys[j]
	// 			for(let j in takens) pml[j] += takens[j]
	// 			if(
	// 				pml.takenCL>pml.carryCL+pml.carryCompensatory+pml.earnedCL+pml.earnedCompensatory
	// 				|| pml.takenSL>pml.carrySL+pml.earnedSL
	// 				|| pml.takenPL>pml.carryPL+pml.earnedPL
	// 			) {
	// 				if(type==='S/L') {
	// 					totalLen += Math.max(pml.carrySL + pml.earnedSL - pml.takenSL + takes.takenSL, 0)
	// 				} else if(type==='C/L') {
	// 					totalLen += Math.max(-pml.takenCL+pml.carryCL+pml.carryCompensatory+pml.earnedCL+pml.earnedCompensatory-takens.takenCL, 0)
	// 				} else if(type==='P/L') {
	// 					totalLen += Math.max(pml.carryPL + pml.earnedPL - pml.takenPL + takes.takenPL, 0)
	// 				}
	// 				break;
	// 			};
	// 		}
	// 	}
	// 	endDate += totalLen
	// 	*/
	// 	form.querySelector('[name="to"]').dataset.minDate = Math.floor(fromDate)
	// 	form.querySelector('[name="to"]').dataset.maxDate = endDate
	// 	//for(let i=0; i<leavesLeft[type]; i++) {}
	// 	fillCalendar(form.querySelector('[name="to"]'), undefined, undefined, Math.floor(fromDate), endDate)
	// 	form['to-full-day']['0'].checked = false;
	// 	form['to-full-day']['1'].checked = false;
	// 	dateChange()
	// }
	/*
	//TODO
	form.querySelector('[name="to"]').onchange = () => {
		const period = (new Date(form.querySelector('[name="to"]').dataset.value).getTime() - new Date(form.querySelector('[name="from"]').dataset.value).getTime())/1000/3600/24 - 1 + (form['from-full-day'].value==="1"?1:0.5)
		if(period===-0.5) form['to-full-day']['0'].disabled = true;
		else form['to-full-day']['0'].disabled = false;
		if(period+1>Math.min(leavesLeft[form.type.value]?.left,2)) form['to-full-day']['1'].disabled = true;
		else form['to-full-day']['1'].disabled = false;
		form['to-full-day']['0'].checked = false;
		form['to-full-day']['1'].checked = false;
		dateChange()
	}
	*/
	// form['to-full-day']['0'].onclick = dateChange
	// form['to-full-day']['1'].onclick = dateChange
}

function formAssigneeChanger(leave) {
	changeAssignee(leave, (person) => {
		fetch('/api/leaves/sub/'+leave, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer '+auth
			},
			body: JSON.stringify({person})
		}).then(res => {
			if(res.status===204) {
				location.reload()
			} else {
				console.log(res.status)
				throw new Error()
			}
		}).catch(e => {
			console.error(e)
		})
	})
}

setupPage()

function addNew() {
	showTable(false)
	showForm(true, leaveForm)
}
function backFromForm() {
	showTable(true)
	showForm(false, leaveForm)
	calendarData = [];
}
