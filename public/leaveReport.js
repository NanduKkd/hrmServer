function setup() {
	const now = new Date();
	fetch('/api/attendance/totalreport/'+now.getFullYear()+'/'+((now.getMonth()+1)+'').padStart(2,'0'), {
		headers: {Authorization: 'Bearer '+auth}
	}).then(res => {
		if(res.status===200) return res.json()
		else {
			const e = new Error()
			e.status = res.status
			throw e;
		}
	}).then(res => {
		console.log(res)
		fillBoxTable('Employees Attendance Report ('+now.getFullYear()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]+')', [
			{label: "Employee"},
			{label: "Attendance"},
			{label: "P/L"},
			{label: "C/L"},
			{label: "S/L"},
			{label: "LoP"},
		], res.map((i) => [
			{label: i.employee.name},
			{label: i.data.attendance},
			{label: i.data.leaves['P/L']},
			{label: i.data.leaves['C/L']},
			{label: i.data.leaves['S/L']},
			{label: i.data.lop},
		]))
		showBoxTable(true)
	}).catch(e => {
		if(e.status===400) showBoxTable(false)
		else
		document.body.innerHTML = "Something went wrong. Please try again."
	})
}

setup()
