let onsiteHolidays: {[key: string]: MinimalHoliday} = {}

let onsiteYearsLoaded: {[key: number]: boolean} = {};


function loadOnsiteData(month: number, year: number) {
	myfetch('calendar/'+year+'/onsite').then(res => {
		res.data.forEach((i: HolidayDocument) => onsiteHolidays[i.year+'-'+i.month+'-'+i.date] = i)
		onsiteYearsLoaded[year] = true;
		if(calendar.dataset.month===month+'' && calendar.dataset.year===year+'')
			fillOnsiteCalendar(month, year);
	}).catch(e => {
		console.error(e)
		document.body.innerHTML = "Something went wrong. Please try again later."
	})
}

async function pageOnsiteSetup() {
	calendar = document.getElementById('calendar')as HTMLDivElement;
	calendar.innerHTML = "";
	calendar.style.display = "block";
	createCalendar(calendar, profile?.superadmin?"changer":"display");

	calendar.addEventListener('monthchange', e => {
		fillOnsiteCalendar(parseInt(calendar.dataset.month || '5'), parseInt(calendar.dataset.year || '2001'))
	})
	calendar.addEventListener('save', e => {
		const date = calendar.dataset.sdate
		const isHoliday = isHolidayInp.checked
		const isMorn = isFulldayInp.checked || mornoreveInps[0].checked;
		const isEve = isFulldayInp.checked || mornoreveInps[1].checked
		const reason = reasonInp.value
		myfetch('calendar/'+calendar.dataset.syear+'/'+calendar.dataset.smonth+'/'+date+'/onsite', {
			method: isHoliday?'PATCH':'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: isHoliday?JSON.stringify({reason, morning: isMorn, evening: isEve}):null,
		})
		if(isHoliday)
			onsiteHolidays[calendar.dataset.syear+'-'+calendar.dataset.smonth+'-'+date] = {reason, morning: isMorn, evening: isEve};
		else
			delete onsiteHolidays[calendar.dataset.syear+'-'+calendar.dataset.smonth+'-'+date];

		fillOnsiteCalendar(parseInt(calendar.dataset.month || '5'), parseInt(calendar.dataset.year || '2001'))
		if(!isHoliday)
			setDefaults(false);
		else if(isMorn && isEve)
			setDefaults(true, reason, true);
		else
			setDefaults(true, reason, false, isMorn?'morning':'evening');
	})
	calendar.addEventListener('change', e => {
		const date = parseInt(calendar.dataset.sdate || '1')
		const pDate = new Date(parseInt(calendar.dataset.year || '2001'), parseInt(calendar.dataset.month || '5'), date)
		// const button = calendar.querySelector('button') as HTMLButtonElement;
		if(pDate.getDay()===0) {
			setDefaults(true, "Sunday", true);
			isHolidayInp.disabled = true
			reasonInp.disabled = true
			reasonLabel.dataset.disabled = 'true'
			isFulldayInp.disabled = true
			isFulldayLabel.dataset.disabled = 'true';
		} else {
			const dayHoli = onsiteHolidays[pDate.getFullYear()+'-'+pDate.getMonth()+'-'+date]
			isHolidayInp.disabled = false
			if(dayHoli){
				if(dayHoli.morning && dayHoli.evening)
					setDefaults(true, dayHoli.reason, true)
				else
					setDefaults(true, dayHoli.reason, false, dayHoli.morning?'morning':'evening');
			} else
				setDefaults(false);
			// isHolidayInp.checked = dayHoli?true:false
			// if(dayHoli) {
			// 	isFulldayInp.checked = dayHoli.morning && dayHoli.evening
			// 	reasonInp.value = dayHoli.reason
			// 	if(dayHoli.morning !== dayHoli.evening) {
			// 		if(dayHoli.morning) mornoreveInps[0].checked = true
			// 		else if(dayHoli.evening) mornoreveInps[1].checked = true
			// 	}
			// }
			// else reasonInp.value = ""
			// checkChanges()
		}
	})

	const now = new Date()
	fillOnsiteCalendar(now.getMonth(), now.getFullYear());


	isHolidayInp = calendar.querySelector('input[name="isholiday"]') as HTMLInputElement;
	reasonInp = calendar.querySelector('input[name="reason"]') as HTMLInputElement;
	reasonLabel = calendar.querySelector('label[data-name="reason"]') as HTMLLabelElement;
	isFulldayInp = calendar.querySelector('input[name="isfullday"]') as HTMLInputElement;
	isFulldayLabel = calendar.querySelector('label[data-name="isfullday"]') as HTMLLabelElement;
	mornoreveInps = [...calendar.querySelectorAll('input[name="mornoreve"]')] as HTMLInputElement[];
	mornoreveLabels = [...calendar.querySelectorAll('label[data-name="mornoreve"]')] as HTMLLabelElement[];
}
function fillOnsiteCalendar(month: number, year: number) {
	if(!onsiteYearsLoaded[year]) {
		loadOnsiteData(month, year)
		return renderCalendar(
			calendar,
			toMonthTable(
				makeMonthDatesArray(month, year).map(i => ({...i, disabled: true})),
				month, year
			),
			month, year
		)
	}
	
	const dates = makeMonthDatesArray(month, year);
	const now = new Date()

	for(let i of dates) {
		const date = new Date(year, month, i.date)
		const dayHoli = onsiteHolidays[year+'-'+month+'-'+i.date]
		if(dayHoli || date.getDay()===0) {
			if(!i.holiday) i.holiday = {}
			i.holiday.morning = dayHoli?dayHoli.morning:true;
			i.holiday.evening = dayHoli?dayHoli.evening:true;
			i.tip = dayHoli?dayHoli.reason:"Sunday";
		}
		if(year===now.getFullYear() && month===now.getMonth() && i.date===now.getDate())
			i.today = true;
	}
	renderCalendar(calendar, toMonthTable(dates, month, year), month, year);
}

pageOnsiteSetup()