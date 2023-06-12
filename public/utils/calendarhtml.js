function createCalendar(container) {
	const nav = container.appendChild(document.createElement('div'))
	nav.classList.add('calendar-header')
	nav.innerHTML = `
		<div onclick="onMonthChange(this, -1)" class="calendar-month-change active">‹</div>
		<div class="calendar-month">2023 February</div>
		<div onclick="onMonthChange(this, 1)" class="calendar-month-change active">›</div>
	`
	const body = container.appendChild(document.createElement('div'))
	body.classList.add('calendar-dates')

	const weekHeader = body.appendChild(document.createElement('div'))
	weekHeader.classList.add('calendar-week')
	['S','M','T','W','T','F','S'].forEach(i => {
		const day = weekHeader.appendChild(document.createElement('div'))
		day.classList.add('calendar-weekday')
		day.innerText = i
	})
	for(let i=0; i<6; i++) {
		const week = body.appendChild(document.createElement('div'))
		week.classList.add('calendar-week')
		['S','M','T','W','T','F','S'].forEach(i => {
			const day = week.appendChild(document.createElement('div'))
			day.classList.add('calendar-day')
			day.addEventListener('click', () => {
				calendarDatePick(day)
			})
		})
	}
}