type LeaveType = 'P/L' | 'C/L' | 'S/L'
declare const backFromForm: () => {};
let leaveType: LeaveType,
	fromDate: string | undefined,
	fromFullDay: boolean | undefined,
	fromLD: LeaveDate | undefined,
	calendarData: MonthData[] = [],
	leaveLegalEndDate: LeaveDate,
	leaveIllegalEndDate: LeaveDate,
	toDate: string | undefined,
	toFullDay: boolean | undefined,
	toLD: LeaveDate | undefined,
	lopDays: number | undefined,
	isFromIllegal: boolean | undefined,
	leaveLength: number | undefined,
	reason: string = '';

let typeInput: HTMLSelectElement,
fromDateInput: HTMLDivElement,
fromFulldayInput: RadioNodeList,
toDateInput: HTMLDivElement,
toFulldayInput: RadioNodeList,
leaveLengthInput: HTMLInputElement,
leaveLoPDisplay: HTMLDivElement,
assignCheckbox: HTMLInputElement,
assignPicker: HTMLSelectElement,
submitBtn: HTMLButtonElement,
reasonInput: HTMLTextAreaElement;



interface HolidayDocument {
	year: number,
	month: number,
	date: number,
	person: string,
	morning: boolean,
	evening: boolean,
	reason: string,
}

interface MinimalLeaveData {
	period: {
		from: string,
		to: string,
		length: number
	},
	type: LeaveType
}

interface MonthData {
	holidays: HolidayDocument[],
	my: number,
	pml: PMLDocument,
	leaves: MinimalLeaveData[]
}

declare interface Window {
	profile?: EmployeeProfile
}


function setupPageForm() {
	const form = leaveForm.children[0] as HTMLFormElement;

	typeInput = form['type'] as HTMLSelectElement
	typeInput.onchange = () => onTypeSelected(typeInput.value as 'S/L'|'C/L'|'P/L')


	fromFulldayInput = form['from-full-day'];
	(fromFulldayInput['0'] as HTMLInputElement).onclick
		= (fromFulldayInput['1'] as HTMLInputElement).onclick
		= () => {
			fromFullDay = fromFulldayInput.value==='1';
			onFromHalfSelected(fromFullDay);
		}

	fromDateInput = form.querySelector('[name="from-date"]') as HTMLDivElement;
	fromDateInput.addEventListener('change', () => onFromSelected(fromDateInput.dataset.value || ''))
	fromDateInput.addEventListener('monthchange', () => onMonthChange(true, parseInt(fromDateInput.dataset.year || '2023'), parseInt(fromDateInput.dataset.month || '0')))


	createCalendar(fromDateInput, "input");
	renderLoadingMonth(fromDateInput);


	toFulldayInput = form['to-full-day'];
	(toFulldayInput['0'] as HTMLInputElement).onclick
		= (toFulldayInput['1'] as HTMLInputElement).onclick
		= () => {
			toFullDay = toFulldayInput.value==='1';
			onToHalfSelected(toFullDay);
		}

	toDateInput = form.querySelector('[name="to-date"]') as HTMLDivElement;
	toDateInput.addEventListener('change', () => onToSelected(toDateInput.dataset.value || ''))
	toDateInput.addEventListener('monthchange', () => onMonthChange(false, parseInt(toDateInput.dataset.year || '2023'), parseInt(toDateInput.dataset.month || '0')))


	createCalendar(toDateInput, "input");
	renderLoadingMonth(toDateInput);


	leaveLengthInput = form['period'];
	leaveLoPDisplay = form.querySelector('input#auto-period+div') as HTMLDivElement;


	assignCheckbox = form['select-assigned'] as HTMLInputElement;
	assignPicker = form['sub'] as HTMLSelectElement;


	reasonInput = form['reason'] as HTMLTextAreaElement;
	reasonInput.addEventListener('change', () => reason = reasonInput.value);

	submitBtn = form.querySelector('button') as HTMLButtonElement;
	submitBtn.addEventListener('click', onSubmit)
}

setupPageForm()

function onSubmit() {
	let sub: string | undefined;
	if(leaveType==='P/L' && assignCheckbox.checked) {
		sub = assignPicker.value;
	}
	if(!leaveType || !fromLD || !toLD || leaveLength===undefined) {
		return alert("Please fill all fields")
	}
	submitBtn.disabled = true;
	myfetch("leaves", {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
		pid: profile?._id,
		sub: sub?{
			person: sub,
		}:undefined,
		period: {
			from: fromLD.encode(),
			to: toLD.encode(),
			length: leaveLength,
		},
		type: leaveType,
		reason,
	})}).then(res => {
		typeInput.value = "";
		resetFrom();
		reasonInput.value = "";
		assignCheckbox.checked = false;
		assignPicker.value = "";
		backFromForm()
		appendTable([[
			{type: "detailed", title: LeaveDate.fromString(res.data.period.from).dateFormat(), subtitle: LeaveDate.fromString(res.data.period.from).timeFormat(false)},
			{type: "detailed", title: LeaveDate.fromString(res.data.period.to).dateFormat(), subtitle: LeaveDate.fromString(res.data.period.to).timeFormat(true)},
			{type: "detailed", title: res.data.period.length},
			{type: "detailed", title: res.data.type},
			res.data.sub?.person && res.data.sub.status==='Rejected'?{
				type: "html",
				html: '<span class="link">Rejected by Assignee</span>'
			}:{type: "detailed", title: res.data.sub?.person && res.data.sub.status!=='Accepted'?(
					res.data.sub.status==='Waiting'?'Waiting for Assignee Response'
					:'Rejected by Assignee'
				):(
					res.data.status==='Waiting'?'Pending Approval'
					:res.data.status==='Rejected'?'Rejected by Superior'
					:'Accepted'
				),
			}
		]])
	}).catch(e => {
		console.error(e);
	}).then(() => {
		submitBtn.disabled = false;
	})
}



async function onMonthChange(isFrom: boolean, year: number, month: number): Promise<void> {
	let cmy: number;
	cmy = month + year*12;
	loadNearby(cmy)
	if(!calendarData.find(i => i.my===cmy)) {
		fromDateInput.dataset.cmy = cmy+'';
		renderLoadingMonth(isFrom?fromDateInput:toDateInput)
	} else if(isFrom) renderFromMonth(cmy)
	else renderToMonth(cmy)
}


interface MonthsLoader {
	loading?: number[],
	loaded?: MonthData[],
	(mys: number[]): Promise<MonthData[]>,
}

const getMonths: MonthsLoader = async function(mys) {
	//TODO implement loaded data getter
	if(!mys.length) return [];

	const monthsData = (await myfetch("leaves/monthsdata", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({mys}),
	})).data as MonthData[];
	calendarData.push(...monthsData);
	return monthsData;
}

async function getMonth(my: number) {
	return (await getMonths([my]))[0];
}
/*
async function loadMonths(my: number): Promise<MonthData>
async function loadMonths(mys: number[]): Promise<void>
async function loadMonths(mys: number | number[]): Promise<MonthData | void> {
	if(mys instanceof Array && !mys.length) return;
	if(!this.loading) this.loading = true;
	const monthsData = (await myfetch("leaves/monthsdata", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({mys: mys instanceof Array?mys:[mys]}),
	})).data as MonthData[];
	calendarData.push(...monthsData);
	if(typeof mys==='number') return monthsData[0];
}
*/

async function loadNearby(my: number) {
	const avail = [];
	for(let i of calendarData) {
		if(i.my>=my-3 || i.my<=my+3) {
			avail.push(i.my);
		}
	}
	const unavail = [];
	for(let i=my-3; i<=my+3; i++) {
		if(avail.indexOf(i)<0) unavail.push(i);
	}
	await getMonths(unavail)

	const fcmy = parseInt(fromDateInput.dataset.cmy || '0')
	if(fcmy && unavail.indexOf(fcmy)>-1) {
		renderFromMonth(fcmy)
	}

	const tcmy = parseInt(toDateInput.dataset.cmy || '0')
	if(tcmy && unavail.indexOf(tcmy)>-1) {
		renderToMonth(tcmy)
	}
}

function resetFrom() {
	deselectCalendar(fromDateInput);
	fromDate = undefined;
	onMonthChange(false, parseInt(fromDateInput.dataset.year || '2023'), parseInt(fromDateInput.dataset.month || '6'));
	resetFromHalfDay()
}
function resetFromHalfDay() {
	(fromFulldayInput['0'] as HTMLInputElement).checked = false;
	(fromFulldayInput['1'] as HTMLInputElement).checked = false;
	(fromFulldayInput['0'] as HTMLInputElement).disabled = !fromLD?.date;
	(fromFulldayInput['1'] as HTMLInputElement).disabled = !fromLD?.date;
	isFromIllegal = false;
	fromLD = undefined;
	fromFullDay = undefined;
	resetTo();
}
function resetTo() {
	deselectCalendar(toDateInput);
	toDate = undefined;
	onMonthChange(false, fromLD?.year || parseInt(toDateInput.dataset.year || '2023'), fromLD?.month || parseInt(toDateInput.dataset.month || '6'));
	resetToHalfDay()
}
function resetToHalfDay() {
	(toFulldayInput['0'] as HTMLInputElement).checked = false;
	(toFulldayInput['1'] as HTMLInputElement).checked = false;
	(toFulldayInput['0'] as HTMLInputElement).disabled = !toLD?.date;
	(toFulldayInput['1'] as HTMLInputElement).disabled = !toLD?.date;
	toFullDay = undefined;
	toLD = undefined;
	resetDayCount();
}
function resetDayCount() {
	leaveLengthInput.value = '';
	leaveLoPDisplay.innerText = '';
	leaveLength = undefined;
	lopDays = undefined;
	resetSubmitButton();
}
function resetSubmitButton() {
	submitBtn.disabled = !leaveLength;
	submitBtn.value = "Apply"+(lopDays || isFromIllegal?"(Special Request)":"");
}

async function renderFromMonth(my: number) {
	const month = my % 12
	const year = Math.floor(my/12)

	const monthData = calendarData.find(i => i.my===my)
	if(!monthData) throw new Error("Render calendar month called without month data (renderFromMonth)")

	if(!leaveType || !monthData.pml) {
		return renderCalendar(
			fromDateInput,
			toMonthTable(
				makeMonthDatesArray(month, year)
				  .map(i => ({...i, disabled: true}))
				, month, year
			), month, year
		)
	}
	const available = new Pml(monthData.pml).available(leaveType);
	const datesArray: CalFixedDay[] = makeMonthDatesArray(month, year);
	for(let i of monthData.leaves) {
		disableLeaveDates(i, monthData.my, datesArray);
	}
	for(let i of monthData.holidays) {
		const dayData = datesArray[i.date-1];
		dayData.holiday = {morning: i.morning, evening: i.evening};
		dayData.disabled = dayData.holiday?.morning && dayData.holiday?.evening;
	}

	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const jd = new Date(profile!.joiningdate);
	for(let i of datesArray) {
		if(!leaveType) i.disabled = true
		else if(!i.disabled) {
			const id = new Date(year, month, i.date);
			if(id.getDay()===0) i.holiday = {morning: true, evening: true};
			i.disabled = id.getDay()===0 || jd.getTime() > id.getTime() ||  !leaveType || leaveType==='P/L' && (available===0 || today.getTime()+30*24*3600000>id.getTime());
			i.warning = id.getDay()!==0 && jd.getTime() <= id.getTime() &&  leaveType && leaveType!=='P/L' && (available===0 || leaveType==='C/L' && today.getTime()+24*3600000>id.getTime() || leaveType==='S/L' && today.getTime()+24*3600000>id.getTime());
		}
	}
	renderCalendar(
		fromDateInput,
		toMonthTable(datesArray, month, year), month, year
	)
}

function disableLeaveDates(leave: MinimalLeaveData, my: number, dates: CalFixedDay[]) {
	const fromLD = LeaveDate.fromString(leave.period.from);
	const toLD = LeaveDate.fromString(leave.period.to);
	let i = LeaveDate.fromDatestamp(fromLD.getDatestamp())
	i.fullday = !fromLD.fullday;
	while(i.getDatestamp()<toLD.getDatestamp() || i.getDatestamp()===toLD.getDatestamp() && (toLD.fullday || !i.fullday)) {
		if(i.getMy()===my) {
			const d = dates[i.date-1];
			if(!d.holiday) d.holiday = {};
			d.holiday![i.fullday?"evening":"morning"] = true;
			if(d.holiday!.morning && d.holiday!.evening)
				d.disabled = true;
		}
		if(i.fullday) {
			i = LeaveDate.fromDatestamp(i.getDatestamp()+1);
			i.fullday = false;
		} else i.fullday = true;
	}
}

async function onTypeSelected(type: LeaveType) {
	leaveType = type;
	const now = new Date()
	if(type==='P/L') {
		assignCheckbox.disabled = false;
		assignPicker.disabled = !assignCheckbox.checked;
	} else {
		assignCheckbox.disabled = true;
		assignPicker.disabled = true;
	}
	resetFrom()
	onMonthChange(true, now.getFullYear(), now.getMonth());
}

async function onFromSelected(date: string) {
	fromDate = date;
	const _d = LeaveDate.fromInput(date, '1')
	const monthData = calendarData.find(i => i.my===_d.getMy())
	if(!monthData) throw new Error("Date in month selected, but month data not loaded? (onFromSelected)")
	const available = new Pml(monthData.pml).available(leaveType)
	const dateHoliday = monthData.holidays.find(i => i.year===_d.year && i.month===_d.month && i.date===_d.date);

	const now = new Date();
	const todayDS = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())/24/3600000;

	resetFromHalfDay();

	(fromFulldayInput['0'] as HTMLInputElement).disabled = dateHoliday?.morning || leaveType==='P/L' && (available===0 || todayDS+30>_d.getDatestamp());
	(fromFulldayInput['0'] as HTMLInputElement).classList.toggle('illegal', !(dateHoliday?.morning || (available>0 && todayDS<=_d.getDatestamp())));

	(fromFulldayInput['1'] as HTMLInputElement).disabled = dateHoliday?.evening || leaveType==='P/L' && (available===0 || todayDS+30>_d.getDatestamp());
	(fromFulldayInput['1'] as HTMLInputElement).classList.toggle('illegal', !(dateHoliday?.evening || (available>0 && todayDS<=_d.getDatestamp())));
}

async function onFromHalfSelected(isFullDay: boolean) {
	// find legal leave max possible limit
	if(!fromDate) return;
	const now = new Date();
	const nmy = now.getMonth() + now.getFullYear()*12;
	fromFullDay = isFullDay
	fromLD = LeaveDate.fromInput(fromDate, isFullDay?'1':'0')
	let lastMy = fromLD.getMy()
	let monthData = calendarData.find(i => i.my === lastMy)
	if(!monthData) throw new Error("Half in month selected, but month data not loaded? (onFromHalfSelected)")
	let leavesAvailable = Pml.availableFromData(monthData.pml, leaveType)
	let day = LeaveDate.fromString(fromLD.toString())
	let lastLegal = day, lastIllegal = day, legalEnd=false;
	while1:
	while(1) {
		for(let i of monthData.leaves) {
			const lfLD = LeaveDate.fromString(i.period.from);
			if(lfLD.getDatestamp()===day.getDatestamp() && lfLD.fullday===day.fullday) {
				break while1;
			}
		}
		const thisHoliday = (monthData.holidays.find(i => i.year===day.year && i.month===day.month && i.date===day.date && (day.fullday?i.morning:i.evening))?true:false) || new Date(day.year, day.month, day.date).getDay()===0
		if(leaveType==='P/L') leavesAvailable -= 0.5;
		else {
			if(thisHoliday) {
				// do nothing
			} else leavesAvailable -= 0.5;
		}

		if(!thisHoliday) {
			if(!legalEnd) lastLegal = day;
			lastIllegal = day;
		}

		if(leavesAvailable<=0) {
			legalEnd = true;
			if(leaveType==='P/L') break;
		}

		if(day.fullday) day = new LeaveDate(day.year, day.month, day.date, false)
		else day = LeaveDate.fromDatestamp(day.getDatestamp()+1)
		if(day.getMy()!==lastMy) {
			if(day.getMy()>nmy+6) {
				break;
			}
			monthData = calendarData.find(i => i.my === day.getMy())
			if(!monthData) {
				console.log('fetching')
				monthData = await getMonth(day.getMy());
				console.log('got monthdata', monthData);
				calendarData.push(monthData)
				const pml = new Pml(monthData.pml)
				if(pml.year!==Math.floor(lastMy/12) && pml.month===0)
					leavesAvailable = Math.min(leavesAvailable, pml.carry(leaveType)) + pml.earned(leaveType)
				else
					leavesAvailable += pml.earned(leaveType)
			}
			lastMy = day.getMy()
		}
	}
	isFromIllegal = fromLD.getDatestamp() <= Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())/24/3600000
	leaveLegalEndDate = new LeaveDate(lastLegal.year, lastLegal.month, lastLegal.date, !lastLegal.fullday);
	leaveIllegalEndDate = new LeaveDate(lastIllegal.year, lastIllegal.month, lastIllegal.date, !lastIllegal.fullday);
	resetTo()
	console.log('legal end: '+leaveLegalEndDate.toString()+'\nspecial end: '+leaveIllegalEndDate.toString())
	// onMonthChange(false, fromLD.year, fromLD.month)
}
type SessionLegal = 'legal' | 'special' | 'illegal';
async function onToSelected(date: string) {
	if(!fromLD) return;
	toDate = date;
	let noonStatus: SessionLegal = 'legal', eveningStatus: SessionLegal = 'legal';
	let _toLD = LeaveDate.fromInput(date, '1');
	let toDS = _toLD.getDatestamp()
	if(toDS>leaveIllegalEndDate.getDatestamp()) {
		noonStatus = 'illegal';
		eveningStatus = 'illegal';
	} else if(toDS===leaveIllegalEndDate.getDatestamp()) {
		if(!leaveIllegalEndDate.fullday) eveningStatus = 'illegal';
	}
	if(toDS>leaveLegalEndDate.getDatestamp()) {
		if(noonStatus==='legal') noonStatus = 'special';
		if(eveningStatus==='legal') eveningStatus = 'special';
	} else if(toDS===leaveLegalEndDate.getDatestamp()) {
		if(!leaveLegalEndDate.fullday && eveningStatus==='legal') eveningStatus = 'special';
	}
	if(fromLD.getDatestamp()===toDS && !fromLD.fullday) noonStatus = 'illegal';

	const toMy = _toLD.getMy()
	const monthData = calendarData.find(i => i.my===toMy);
	if(!monthData) throw new Error("Date in month selected, but month data not loaded? (onToSelected)")

	const dateHoliday = monthData.holidays.find(i => i.year===_toLD.year && i.month===_toLD.month && i.date===_toLD.date);
	if(dateHoliday?.morning) noonStatus = 'illegal';
	if(dateHoliday?.evening) eveningStatus = 'illegal';
	
	resetToHalfDay();
	(toFulldayInput['0'] as HTMLInputElement).disabled = noonStatus==='illegal';//dateHoliday?.morning || fromLD.getDatestamp()===_toLD.getDatestamp() && !fromLD.fullday || leaveType==='P/L' && !isNoonLegal;
	(toFulldayInput['0'] as HTMLInputElement).classList.toggle('illegal', noonStatus==='special');//!(dateHoliday?.morning || fromLD.getDatestamp()===_toLD.getDatestamp() && !fromLD.fullday || isNoonLegal));

	(toFulldayInput['1'] as HTMLInputElement).disabled = eveningStatus==='illegal';//dateHoliday?.evening || leaveType==='P/L' && !isEveningLegal;
	(toFulldayInput['1'] as HTMLInputElement).classList.toggle('illegal', eveningStatus==='special');//!(dateHoliday?.evening || isEveningLegal));
	
}

async function onToHalfSelected(isFullDay: boolean) {
	if(!fromLD || !toDate) return;
	let lastMy: number = fromLD.getMy()
	lopDays = 0;
	leaveLength = 0;
	toLD = LeaveDate.fromInput(toDate, isFullDay?'1':'0')
	function incrLeave(): void {
		leaveLength! += 0.5;
		if(leavesAvailable>0) leavesAvailable -= 0.5;
		else {
			if(leaveType==='P/L') throw new Error("Illegal leaves: P/L count should not be more than avalable!")
			lopDays! += 0.5;
		}
	}
	let monthData = calendarData.find(i => i.my === lastMy)
	if(!monthData) throw new Error("Date in month selected, but month data not loaded? (onToSelected)")
	let leavesAvailable = Pml.availableFromData(monthData.pml, leaveType)
	let day = LeaveDate.fromDatestamp(fromLD.getDatestamp())
	day.fullday = !fromLD.fullday
	while(toLD.getDatestamp()>day.getDatestamp() || day.getDatestamp()===toLD.getDatestamp() && (toLD.fullday || !day.fullday)) {
		if(leaveType==='P/L') {
			incrLeave()
		} else {
			const thisHoliday = (monthData.holidays.find(i => i.year===day.year && i.month===day.month && i.date===day.date && (day.fullday?i.evening:i.morning))?true:false) || new Date(day.year, day.month, day.date).getDay()===0
			if(thisHoliday) {
				// do nothing
			} else {
				incrLeave()
			}
		}
		if(!day.fullday) day = new LeaveDate(day.year, day.month, day.date, true)
		else {
			day = LeaveDate.fromDatestamp(day.getDatestamp()+1)
			day.fullday = false;
		}
		if(day.getMy()!==lastMy) {
			monthData = calendarData.find(i => i.my === day.getMy())
			if(!monthData) {
				monthData = await getMonth(day.getMy());
				const pml = new Pml(monthData.pml)
				if(pml.year!==Math.floor(lastMy/12) && pml.month===0)
					leavesAvailable = Math.min(leavesAvailable, pml.carry(leaveType)) + pml.earned(leaveType)
				else
					leavesAvailable += pml.earned(leaveType)
			}
			lastMy = day.getMy()
		}
	}
	resetSubmitButton();
	//TODO remove after test
	console.log("LoP count for this leave is "+lopDays, "length is "+leaveLength)
	leaveLengthInput.value = leaveLength+'';
	leaveLoPDisplay.innerText = lopDays?"LoP Count: "+lopDays+' days':''
}

async function renderToMonth(my: number) {
	const month = my % 12
	const year = Math.floor(my/12)

	if(fromFullDay===undefined || !fromLD) {
		return renderCalendar(
			toDateInput,
			toMonthTable(
				makeMonthDatesArray(month, year)
				  .map(i => ({...i, disabled: true}))
				, month, year
			), month, year
		)
	}

	const monthData = calendarData.find(i => i.my===my)
	if(!monthData) throw new Error("Render calendar month called without month data (renderFromMonth)")
	const datesArray: CalFixedDay[] = makeMonthDatesArray(month, year);
	for(let i of monthData.leaves) {
		disableLeaveDates(i, monthData.my, datesArray);
	}
	for(let i of monthData.holidays) {
		const dayData = datesArray[i.date-1];
		dayData.holiday = {morning: i.morning, evening: i.evening};
		dayData.disabled = dayData.holiday?.morning && dayData.holiday?.evening;
	}
	for(let i of datesArray) {
		const d = new Date(year, month, i.date);
		if(d.getDay()===0) {
			i.disabled = true;
			i.holiday = {morning: true, evening: true};
		}
	}
	const endLegalDS = leaveLegalEndDate.getDatestamp();
	const endIllegalDS = leaveIllegalEndDate.getDatestamp();
	const startDS = fromLD.getDatestamp();
	for(let i of datesArray) {
		if(!leaveType) i.disabled = true
		else if(!i.disabled) {
			const ds = new LeaveDate(year, month, i.date, true).getDatestamp()
			i.disabled = !leaveType || ds > endIllegalDS || ds < startDS;
			i.warning = leaveType && ds <= endIllegalDS && ds > endLegalDS;
		}
	}
	renderCalendar(
		toDateInput,
		toMonthTable(datesArray, month, year), month, year
	)
}
