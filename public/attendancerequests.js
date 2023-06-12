function setupPage(){
	myfetch('attendance/requests').then(res => {
		const data = res.data;
		fillTable("Attendance requests for you", [
			{name: "Employee"},
			{name: "Date"},
			{name: "Period"},
			{name: "Location"},
			{name: "Actions"},
		], data.map(i => [
			{title: i.person},
			{title: new LeaveDate(i.date.year, i.date.month, i.date.date, true).dateFormat()},
			{title: i.entry.status==='morning'?
				i.exit.status==='evening' || i.exit.status==='anotherday'?
					'Full Day'
					:i.exit.status!=='beforenoon'?
						'Morning Half'
						:'-'
				:i.entry.status!=='afternoon'?
					i.exit.status==='evening' || i.exit.status==='anotherday'?
						'Evening Half'
						:'-'
					:'-'
			, subtitle: timeFormat(i.entry.date)+' - '+timeFormat(i.exit.date)},
			// {type: 'html', html: `
			// 	<div class="list-item-column">
			// 		<button onclick="">Show Lcoation</button>
			// 		<button onclick="acceptAttendance('${i._id}')">Verify</button>
			// 	</div>
			// `},
			{type: 'html', html: `
				<div class="list-item-column">
					<a href="https://www.google.com/maps/search/?api=1&query=${i.entry.location.latitude}%2C${i.entry.location.longitude}" target="blank">${i.entry.location.latitude}, ${i.entry.location.longitude}</a>
				</div>
			`},
			// {title: i.entry.location.latitude+', '+i.entry.location.longitude, onclick: `acceptAttendance('${i._id}')`},
			{title: 'Verify', onclick: `acceptAttendance('${i._id}')`}
		]))
		showTable(true)
	}).catch(e => {
		if(e.status===405) {
			table.innerHTML = "<div style=''>No employees reporting under you.</div>"
			showTable(true)
		} else {
			console.log(e.status, '---')
			console.error(e)
			document.body.innerHTML = "Something went wrong. Pleasde try again later."
		}
	})

}

setupPage()

async function acceptAttendance(id) {
	try {
		await myfetch('attendance/verify/'+id, {method: 'PATCH'})
		location.reload()
	} catch (e) {
		console.error(e)
		document.body.innerHTML = 'Something went wront. Please try again.'
	}
}

function timeFormat(d) {
	d = new Date(d);
	return (d.getHours()%12||12)+':'+(d.getMinutes()+'').padStart(2, '0')+' '+(d.getHours()>11?'PM':'AM')
}