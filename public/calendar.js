let calendar, cYear, cMonth;

let holidays = {};
const yearsLoaded = {};
function pageSetup() {
	calendar = document.getElementById('calendar')
	let unit = Math.max(Math.min(document.querySelector('.body').clientWidth, document.querySelector('.body').clientHeight)/40, 20)
	calendar.style.fontSize = unit+'px'
	calendar.style.width = unit*24+'px'
	calendar.style.display = 'block'
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth();
	loadData(year, month)
}
function loadData(year, month) {
	fetch('/api/calendar/'+year+(profile.onsite?'/onsite':'/office'), {headers: {Authorization: 'Bearer '+auth}}).then(res => {
		if(res.status===200) return res.json()
		else {
			console.log(res.status)
			throw new Error()
		}
	}).then(res => {
		res.forEach(i => holidays[i.year+'-'+i.month+'-'+i.date] = i)
		yearsLoaded[year] = true;
		fillCalendar(year, month);
	}).catch(e => {
		console.error(e)
		document.body.innerHTML = "Something went wrong. Please try again later."
	})
}

pageSetup()

function calendarMonthChange(change) {
	const nYear = cMonth+change>11?cYear+1:cMonth+change<0?cYear-1:cYear
	const nMonth = cMonth+change>11?cMonth-11:cMonth+change<0?cMonth+11:cMonth+change
	if(!yearsLoaded[nYear]) loadData(nYear, nMonth)
	else fillCalendar(nYear, nMonth)
}

function calendarDatePick(target) {
	if(!profile.admin) return
	const date = target.dataset.date;
	if(date<1) return;
}
function holidaySaved() {
}




function fillCalendar(year, month) {
	const now = new Date()
	if(!year) year = now.getFullYear()
	if(month===undefined) month = now.getMonth()
	const monthstart = new Date(`${year}-${((month+1)+'').padStart(2,'0')}-01T00:00:00.000Z`)
	const monthstartday = monthstart.getDay()
	let monthday = 0;
	cYear = year;
	cMonth = month;
	calendar.querySelector('.calendar-month').innerText = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month] + ' ' + year
	const monthlength = (
	new Date(`${month===11?year+1:year}-${((((month+1)%12) + 1)+'').padStart(2,'0')}-01T00:00:00.000Z`).getTime()
		- monthstart.getTime()
	)/(3600000*24)
	for(let i of calendar.querySelectorAll('.calendar-day')) {
		monthday++;
		if(monthday>monthstartday && monthday-monthstartday<=monthlength) {
			const thisDate = new Date(`${year}-${((month+1)+'').padStart(2,'0')}-${((monthday-monthstartday)+'').padStart(2,'0')}T00:00:00.000Z`)
			//const thisDateDs = thisDate.getTime()/3600000/24
			if(now.getMonth()===month && now.getFullYear()===year && now.getDate()===monthday-monthstartday) {
				i.classList.add('today')
			} else i.classList.remove('today')

			if(document.getElementById('calendarChanger').dataset.date===(monthday-monthstartday)+'') {
				i.classList.add('selected')
			} else {
				i.classList.remove('selected')
			}


			i.innerHTML = `
				<div class="calendar-day-label">${monthday-monthstartday}</div>
				<div class="calendar-day-bg">
					<span class="morning-leave"></span>
					<span class="evening-leave"></span>
				</div>
				<span class="calendar-day-tooltip"></span>
			`
			i.querySelector('.calendar-day-label').innerText = monthday-monthstartday;
			i.classList.add('active')
			i.dataset.date = monthday-monthstartday;
			const dayHoli = holidays[year+'-'+month+'-'+(monthday-monthstartday)]
			if(dayHoli) {
				i.querySelector('.calendar-day-tooltip').innerText = dayHoli.reason || "-"
			} else if(thisDate.getDay()===0) {
				i.querySelector('.calendar-day-tooltip').innerText = 'Sunday'
			}
			i.querySelector('.calendar-day-bg .morning-leave').style.visibility = thisDate.getDay()===0 || dayHoli?.morning?'visible':'hidden'
			i.querySelector('.calendar-day-bg .evening-leave').style.visibility = thisDate.getDay()===0 || dayHoli?.evening?'visible':'hidden'
			if(dayHoli || thisDate.getDay()===0) {
				i.classList.add('holiday')
			} else {
				i.classList.remove('holiday')
			}
		}
		else {
			i.classList.remove('active')
			i.classList.remove('today')
			i.classList.remove('holiday')
			i.classList.remove('selected')
			i.innerText = '';
			i.dataset.date = 0;
		}
	}
	if(document.getElementById('calendarChanger').style.display === 'block') {
		const date = document.getElementById('calendarChanger').dataset.date;
		calendarDatePick(calendar.querySelector('[data-date="'+date+'"]'))
	}
}


