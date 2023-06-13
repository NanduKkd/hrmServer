"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let officeHolidays = {};
let officeYearsLoaded = {};
function loadOfficeData(month, year) {
    myfetch('calendar/' + year + '/office').then(res => {
        res.data.forEach((i) => officeHolidays[i.year + '-' + i.month + '-' + i.date] = i);
        officeYearsLoaded[year] = true;
        if (calendar.dataset.month === month + '' && calendar.dataset.year === year + '')
            fillOfficeCalendar(month, year);
    }).catch(e => {
        console.error(e);
        document.body.innerHTML = "Something went wrong. Please try again later.";
    });
}
function pageOfficeSetup() {
    return __awaiter(this, void 0, void 0, function* () {
        calendar = document.getElementById('calendar');
        calendar.innerHTML = "";
        calendar.style.display = "block";
        createCalendar(calendar, (profile === null || profile === void 0 ? void 0 : profile.superadmin) ? "changer" : "display");
        calendar.addEventListener('monthchange', e => {
            fillOfficeCalendar(parseInt(calendar.dataset.month || '5'), parseInt(calendar.dataset.year || '2001'));
        });
        calendar.addEventListener('save', e => {
            const date = calendar.dataset.sdate;
            const isHoliday = isHolidayInp.checked;
            const isMorn = isFulldayInp.checked || mornoreveInps[0].checked;
            const isEve = isFulldayInp.checked || mornoreveInps[1].checked;
            const reason = reasonInp.value;
            myfetch('calendar/' + calendar.dataset.syear + '/' + calendar.dataset.smonth + '/' + date + '/office', {
                method: isHoliday ? 'PATCH' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: isHoliday ? JSON.stringify({ reason, morning: isMorn, evening: isEve }) : null,
            });
            if (isHoliday)
                officeHolidays[calendar.dataset.syear + '-' + calendar.dataset.smonth + '-' + date] = { reason, morning: isMorn, evening: isEve };
            else
                delete officeHolidays[calendar.dataset.syear + '-' + calendar.dataset.smonth + '-' + date];
            fillOfficeCalendar(parseInt(calendar.dataset.month || '5'), parseInt(calendar.dataset.year || '2001'));
            if (!isHoliday)
                setDefaults(false);
            else if (isMorn && isEve)
                setDefaults(true, reason, true);
            else
                setDefaults(true, reason, false, isMorn ? 'morning' : 'evening');
        });
        calendar.addEventListener('change', e => {
            const date = parseInt(calendar.dataset.sdate || '1');
            const pDate = new Date(parseInt(calendar.dataset.year || '2001'), parseInt(calendar.dataset.month || '5'), date);
            // const button = calendar.querySelector('button') as HTMLButtonElement;
            if (pDate.getDay() === 0) {
                setDefaults(true, "Sunday", true);
                isHolidayInp.disabled = true;
                reasonInp.disabled = true;
                reasonLabel.dataset.disabled = 'true';
                isFulldayInp.disabled = true;
                isFulldayLabel.dataset.disabled = 'true';
            }
            else {
                const dayHoli = officeHolidays[pDate.getFullYear() + '-' + pDate.getMonth() + '-' + date];
                isHolidayInp.disabled = false;
                if (dayHoli) {
                    if (dayHoli.morning && dayHoli.evening)
                        setDefaults(true, dayHoli.reason, true);
                    else
                        setDefaults(true, dayHoli.reason, false, dayHoli.morning ? 'morning' : 'evening');
                }
                else
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
        });
        const now = new Date();
        fillOfficeCalendar(now.getMonth(), now.getFullYear());
        isHolidayInp = calendar.querySelector('input[name="isholiday"]');
        reasonInp = calendar.querySelector('input[name="reason"]');
        reasonLabel = calendar.querySelector('label[data-name="reason"]');
        isFulldayInp = calendar.querySelector('input[name="isfullday"]');
        isFulldayLabel = calendar.querySelector('label[data-name="isfullday"]');
        mornoreveInps = [...calendar.querySelectorAll('input[name="mornoreve"]')];
        mornoreveLabels = [...calendar.querySelectorAll('label[data-name="mornoreve"]')];
    });
}
function fillOfficeCalendar(month, year) {
    if (!officeYearsLoaded[year]) {
        loadOfficeData(month, year);
        return renderCalendar(calendar, toMonthTable(makeMonthDatesArray(month, year).map(i => (Object.assign(Object.assign({}, i), { disabled: true }))), month, year), month, year);
    }
    const dates = makeMonthDatesArray(month, year);
    const now = new Date();
    for (let i of dates) {
        const date = new Date(year, month, i.date);
        const dayHoli = officeHolidays[year + '-' + month + '-' + i.date];
        if (dayHoli || date.getDay() === 0) {
            if (!i.holiday)
                i.holiday = {};
            i.holiday.morning = dayHoli ? dayHoli.morning : true;
            i.holiday.evening = dayHoli ? dayHoli.evening : true;
            i.tip = dayHoli ? dayHoli.reason : "Sunday";
        }
        if (year === now.getFullYear() && month === now.getMonth() && i.date === now.getDate())
            i.today = true;
    }
    renderCalendar(calendar, toMonthTable(dates, month, year), month, year);
}
pageOfficeSetup();
