function setupPage(){
	myfetch('attendance/requests').then(res => {
		const data = res.data;
		if(!data.date) {
			table.innerHTML = "<div class=''>No requests found.</div>"
			showTable(true)
			return;
		}
		const d = new Date(data.date)
		table.dataset.year = d.getFullYear();
		table.dataset.month = d.getMonth();
		table.dataset.date = d.getDate();
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		fillTable("Attendance requests on "+d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear(), [
			{name: "Employee"},
			{name: "Time"},
			{name: "Morning", flex: 0.5},
			{name: "Evening", flex: 0.5},
			{name: "Location"},
			{name: "Actions", flex: 0.5},
		], data.attendances.map(i => [
			{title: i.person?.name, subtitle: i.person?.post},
			{title: i.entry?.status?timeFormat(i.entry.date)+' - '+
				(i.exit?.status?timeFormat(i.exit.date):''):'-'},
			{
				title: i.attendedmorning
					?'Attended'
					:i.morning==='holiday'
						?'Holiday'
						:i.morning==='leave'
							?'Leave'
							:'Redmark',
				flex: 0.5,
				subtitle: i.attendedmorning && i.morning==='holiday'?'(Compensatory)':'',
				color: i.morning==='leave' || !i.attendedmorning && i.morning==='holiday'
					?'gray'
					:!i.attendedmorning
						?'red'
						:'green'
			},
			{
				title: i.attendedevening
					?'Attended'
					:i.evening==='holiday'
						?'Holiday'
						:i.evening==='leave'
							?'Leave'
							:'Redmark',
				flex: 0.5,
				subtitle: i.attendedevening && i.evening==='holiday'?'(Compensatory)':'',
				color: i.evening==='leave' || !i.attendedevening && i.evening==='holiday'
					?'gray'
					:!i.attendedevening
						?'red'
						:'green'
			},
			// {type: 'html', html: `
			// 	<div class="list-item-column">
			// 		<button onclick="">Show Lcoation</button>
			// 		<button onclick="acceptAttendance('${i._id}')">Verify</button>
			// 	</div>
			// `},
			i.entry?.location?{type: 'html', html: `
				<div class="list-item-column">
					<a href="https://www.google.com/maps/search/?api=1&query=${i.entry.location.latitude}%2C${i.entry.location.longitude}" target="blank">${i.entry.location.latitude}, ${i.entry.location.longitude}</a>
				</div>
			`}:{title: '-'},
			// {title: i.entry.location.latitude+', '+i.entry.location.longitude, onclick: `acceptAttendance('${i._id}')`},
			!i.verified && (!i.entry?.status || i.exit?.status) && (today.getTime()>d.getTime() || today.getTime()===d.getTime() && now.getHours()>18)
				?{title: 'Verify', onclick: `acceptAttendance('${i.person._id}', ${i.attendedmorning?'true':'false'}, ${i.attendedevening?'true':'false'})`, flex: 0.5}
				:{title: i.entry?.status && !i.exit?.status?'Did not Exit':'-', flex: 0.5},
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

async function acceptAttendance(person, morning, evening) {
	try {
		const year = parseInt(table.dataset.year)
		const month = parseInt(table.dataset.month)
		const date = parseInt(table.dataset.date)
		await myfetch('attendance/verify', {method: 'PATCH', headers: {
			'Content-Type': 'application/json',
		}, body: JSON.stringify({
			year, month, date, person,
			morning, evening
		})})
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