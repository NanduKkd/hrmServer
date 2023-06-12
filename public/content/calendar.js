"use strict";
function createCalendar(elem, type) {
    var _a;
    let changer;
    let container;
    if (type === 'input') {
        container = elem.querySelector('.calendar-picker');
    }
    else {
        container = elem;
    }
    const now = new Date();
    elem.dataset.month = now.getMonth() + '';
    elem.dataset.year = now.getFullYear() + '';
    elem.dataset.type = type;
    const nav = container.appendChild(document.createElement('div'));
    nav.classList.add('calendar-header');
    const leftNav = nav.appendChild(document.createElement('div'));
    leftNav.classList.add('calendar-month-change', 'active');
    leftNav.innerText = "‹";
    leftNav.addEventListener('click', () => {
        const thisMonth = parseInt(elem.dataset.month || '0');
        const thisYear = parseInt(elem.dataset.year || '0');
        elem.dataset.month = (thisMonth ? thisMonth - 1 : 11) + '';
        elem.dataset.year = (thisMonth ? thisYear : thisYear - 1) + '';
        elem.dispatchEvent(new Event('monthchange'));
    });
    const calendarMonthLabel = nav.appendChild(document.createElement('div'));
    calendarMonthLabel.classList.add('calendar-month');
    // calendarMonthLabel.innerText
    const rightNav = nav.appendChild(document.createElement('div'));
    rightNav.classList.add('calendar-month-change', 'active');
    rightNav.innerText = "›";
    rightNav.addEventListener('click', () => {
        const thisMonth = parseInt(elem.dataset.month || '0');
        const thisYear = parseInt(elem.dataset.year || '0');
        elem.dataset.month = (thisMonth !== 11 ? thisMonth + 1 : 0) + '';
        elem.dataset.year = (thisMonth !== 11 ? thisYear : thisYear + 1) + '';
        elem.dispatchEvent(new Event('monthchange'));
    });
    /*
    nav.innerHTML = `
        <div onclick="onMonthChange(this, -1)" class="calendar-month-change active">‹</div>
        <div class="calendar-month">2023 February</div>
        <div onclick="onMonthChange(this, 1)" class="calendar-month-change active">›</div>
    `
    */
    const body = container.appendChild(document.createElement('div'));
    body.classList.add('calendar-dates');
    const weekHeader = body.appendChild(document.createElement('div'));
    weekHeader.classList.add('calendar-week');
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(i => {
        const day = weekHeader.appendChild(document.createElement('div'));
        day.classList.add('calendar-weekday');
        day.innerText = i;
    });
    for (let i = 0; i < 6; i++) {
        const week = body.appendChild(document.createElement('div'));
        week.classList.add('calendar-week');
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(() => {
            const day = week.appendChild(document.createElement('div'));
            day.classList.add('calendar-day');
            const dayBack = day.appendChild(document.createElement('div'));
            dayBack.classList.add('calendar-day-bg');
            const dayMorning = dayBack.appendChild(document.createElement('div'));
            dayMorning.classList.add('morning');
            const dayEvening = dayBack.appendChild(document.createElement('div'));
            dayEvening.classList.add('evening');
            const dayLabel = day.appendChild(document.createElement('div'));
            dayLabel.classList.add('label');
            const tip = day.appendChild(document.createElement('div'));
            tip.classList.add('tip');
            if (type !== 'dispay') {
                day.addEventListener('click', () => {
                    var _a;
                    const cYear = parseInt(elem.dataset.year || '2023');
                    const cMonth = parseInt(elem.dataset.month || '0');
                    const cDate = parseInt(day.dataset.date || '1');
                    elem.dataset.syear = cYear + '';
                    elem.dataset.smonth = cMonth + '';
                    elem.dataset.sdate = day.dataset.date;
                    if (type === 'input') {
                        elem.dataset.value =
                            cYear
                                + '-'
                                + ((cMonth + 1) + '').padStart(2, '0')
                                + '-'
                                + (cDate + '').padStart(2, '0');
                        elem.querySelector('.calendar-input-text').innerText =
                            (cDate + '').padStart(2, '0')
                                + '/'
                                + ((cMonth + 1) + '').padStart(2, '0')
                                + '/'
                                + cYear;
                        elem.blur();
                        elem.dispatchEvent(new Event('change'));
                    }
                    else if (type === 'changer') {
                        changer.querySelector('.calendar-changer-title').innerText = cYear + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][cMonth] + ' ' + cDate;
                        changer.style.display = 'block';
                        changer.dataset.date = cDate + '';
                        elem.dataset.value =
                            cYear
                                + '-'
                                + ((cMonth + 1) + '').padStart(2, '0')
                                + '-'
                                + (cDate + '').padStart(2, '0');
                        elem.dispatchEvent(new Event('change'));
                    }
                    (_a = elem.querySelector('.selected')) === null || _a === void 0 ? void 0 : _a.classList.remove('selected');
                    day.classList.add('selected');
                });
            }
            else {
                day.addEventListener('click', e => {
                    if (day.classList.contains('show-tip'))
                        day.classList.remove('show-tip');
                    else {
                        const focused = calendar.querySelector('.calendar-day.show-tip');
                        if (focused)
                            focused.classList.remove('show-tip');
                        day.classList.add('show-tip');
                    }
                });
            }
        });
    }
    if (type === 'changer') {
        changer = container.appendChild(document.createElement('div'));
        changer.style.display = 'none';
        changer.innerHTML = `
			<div class="calendar-changer-title"></div>
			<div class="calendar-changer-body">
				<input onclick="checkChanges()" name="isholiday" type="checkbox"><label>Holiday</label>
				<button>Save</button>
			</div>
			<div style="flex-direction: column; display: flex; padding: 0.5em 0.6em;">
				<label data-name="reason">Reason</label>
				<input name="reason" style="padding: 0.5em" onkeyup="checkChanges()">
			</div>
			<div class="calendar-changer-body">
				<input onclick="checkChanges()" name="isfullday" type="checkbox" checked disabled>
				<label data-name="isfullday" data-disabled>Full day holiday</label>
			</div>
			<div class="calendar-changer-body">
				<input name="mornoreve" type="radio" value="morning" onclick="checkChanges()" disabled>
				<label data-name="mornoreve" data-disabled>Morning Half</label>
				<input name="mornoreve" type="radio" value="evening" onclick="checkChanges()" disabled>
				<label data-name="mornoreve" data-disabled>Evening Half</label>
			</div>
		`;
        (_a = changer.querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', e => {
            calendar.dispatchEvent(new Event('save'));
        });
        changer.addEventListener('change', e => e.stopPropagation());
    }
}
function renderCalendar(elem, calData, month, year) {
    var _a, _b;
    elem.dataset.month = month + '';
    elem.dataset.year = year + '';
    const type = elem.dataset.type;
    const container = type === 'input' ? elem.querySelector('.calendar-picker') : elem;
    const weekdays = container.querySelectorAll('.calendar-day');
    container.querySelector('.calendar-month').innerText = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'][month] + ' ' + year;
    for (let wi = 0; wi < 6; wi++) {
        for (let di = 0; di < 7; di++) {
            const dayDiv = weekdays[wi * 7 + di];
            const dayData = calData[wi][di];
            if (dayData.type === 'empty') {
                dayDiv.classList.remove('holiday-morning');
                dayDiv.classList.remove('holiday-evening');
                dayDiv.classList.add('disabled');
                dayDiv.classList.remove('warning');
                dayDiv.classList.remove('today');
                dayDiv.classList.remove('selected');
                dayDiv.querySelector('.label').innerText = '';
                const tip = dayDiv.querySelector('div.tip');
                tip.classList.remove('enabled');
            }
            else {
                dayDiv.classList.toggle('disabled', dayData.disabled ? true : false);
                dayDiv.classList.toggle('warning', dayData.warning ? true : false);
                dayDiv.classList.toggle('holiday-morning', ((_a = dayData.holiday) === null || _a === void 0 ? void 0 : _a.morning) ? true : false);
                dayDiv.classList.toggle('holiday-evening', ((_b = dayData.holiday) === null || _b === void 0 ? void 0 : _b.evening) ? true : false);
                dayDiv.classList.toggle('today', dayData.today ? true : false);
                dayDiv.classList.toggle('selected', dayData.date + '' === elem.dataset.sdate && month + '' === elem.dataset.smonth && year + '' === elem.dataset.syear);
                dayDiv.querySelector('.label').innerText = dayData.date + '';
                dayDiv.dataset.date = dayData.date + '';
                const tip = dayDiv.querySelector('div.tip');
                if (dayData.tip) {
                    tip.classList.add('enabled');
                    tip.innerText = dayData.tip;
                }
                else
                    tip.classList.remove('enabled');
            }
        }
    }
}
function deselectCalendar(elem) {
    elem.dataset.syear = '';
    elem.dataset.smonth = '';
    elem.dataset.sdate = '';
    elem.dataset.value = '';
    elem.querySelector('.calendar-input-text').innerText = 'dd/mm/yyyy';
}
function renderLoadingMonth(calendar) {
    const container = calendar.dataset.type === 'input' ? calendar.querySelector('.calendar-picker') : calendar;
    const weekdays = container.querySelectorAll('.calendar-day');
    for (let wi = 0; wi < 6; wi++) {
        for (let di = 0; di < 7; di++) {
            const dayDiv = weekdays[wi * 7 + di];
            dayDiv.classList.remove('holiday-morning');
            dayDiv.classList.remove('holiday-evening');
            dayDiv.classList.add('disabled');
            dayDiv.classList.remove('today');
            dayDiv.querySelector('.label').innerText = '';
        }
    }
}
function makeMonthDatesArray(month, year) {
    const nxtFirst = new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1);
    const crntEnd = new Date(nxtFirst.getTime() - 24 * 3600 * 1000).getDate();
    const arr = [];
    const now = new Date();
    for (let i = 1; i <= crntEnd; i++) {
        arr.push({
            type: "date",
            date: i,
            today: now.getFullYear() === year && now.getMonth() === month && now.getDate() === i,
        });
    }
    return arr;
}
function toMonthTable(monthDates, month, year) {
    const monthStartDay = new Date(year, month, 1).getDay();
    const monthTable = new Array(6);
    for (let i = 0; i < 6; i++) {
        monthTable[i] = new Array(7);
        for (let j = 0; j < 7; j++) {
            const date = i * 7 + j - monthStartDay;
            if (date < 0 || date >= monthDates.length) {
                monthTable[i][j] = { type: 'empty' };
            }
            else {
                monthTable[i][j] = monthDates[date];
            }
        }
    }
    return monthTable;
}
function setDefaults(isHoliday, reason, isFullday, mornOrEve) {
    isHolidayInp.checked = isHoliday;
    isHolidayInp.dataset.checked = isHoliday + '';
    const button = calendar.querySelector('button');
    if (!isHoliday) {
        isFulldayInp.disabled = true;
        reasonInp.disabled = true;
        reasonInp.value = "";
        reasonLabel.dataset.disabled = 'true';
        mornoreveInps.forEach(e => e.disabled = true);
        mornoreveLabels.forEach(e => e.dataset.disabled = 'true');
    }
    else {
        reasonInp.disabled = false;
        reasonLabel.dataset.disabled = 'false';
        reasonInp.dataset.value = reason;
        reasonInp.value = reason || '';
        isFulldayInp.disabled = false;
        isFulldayLabel.dataset.disabled = 'false';
        isFulldayInp.checked = isFullday || false;
        isFulldayInp.dataset.checked = isFullday + '';
        if (isFullday) {
            mornoreveInps.forEach(i => i.disabled = true);
            mornoreveLabels.forEach(e => e.dataset.disabled = 'true');
        }
        else {
            mornoreveInps[0].checked = mornOrEve === 'morning';
            mornoreveInps[0].dataset.checked = (mornOrEve === 'morning') + '';
            mornoreveInps[1].checked = mornOrEve === 'evening';
            mornoreveInps[1].dataset.checked = (mornOrEve === 'evening') + '';
            mornoreveInps.forEach(i => i.disabled = false);
            mornoreveLabels.forEach(e => e.dataset.disabled = 'false');
        }
    }
    button.disabled = true;
}
function checkChanges() {
    const button = calendar.querySelector('button');
    const isHoliday = isHolidayInp.checked;
    const isFullday = isFulldayInp.checked;
    if (!isHoliday) {
        isFulldayInp.disabled = true;
        isFulldayLabel.dataset.disabled = 'true';
        reasonInp.disabled = true;
        reasonLabel.dataset.disabled = 'true';
        mornoreveInps.forEach(e => e.disabled = true);
        mornoreveLabels.forEach(e => e.dataset.disabled = 'true');
    }
    else {
        isFulldayInp.disabled = false;
        isFulldayLabel.dataset.disabled = 'false';
        reasonInp.disabled = false;
        reasonLabel.dataset.disabled = 'false';
        if (isFullday) {
            mornoreveInps.forEach(i => i.disabled = true);
            mornoreveLabels.forEach(e => e.dataset.disabled = 'true');
        }
        else {
            if (!mornoreveInps[0].checked && !mornoreveInps[1].checked)
                mornoreveInps[0].checked = true;
            mornoreveInps.forEach(i => i.disabled = false);
            mornoreveLabels.forEach(e => e.dataset.disabled = 'false');
        }
    }
    const isMorn = mornoreveInps[0].checked;
    const isEve = mornoreveInps[1].checked;
    const reason = reasonInp.value;
    const oldIsHoliday = isHolidayInp.dataset.checked === 'true';
    const oldIsFullday = isFulldayInp.dataset.checked === 'true';
    const oldReason = reasonInp.dataset.value;
    const oldIsMorn = mornoreveInps[0].dataset.checked === 'true';
    const oldIsEve = mornoreveInps[1].dataset.checked === 'true';
    button.disabled = !(isHoliday !== oldIsHoliday
        || isHoliday && reason !== oldReason
        || isHoliday && isFullday !== oldIsFullday
        || isHoliday && !isFullday && (isMorn !== oldIsMorn || isEve !== oldIsEve));
}
