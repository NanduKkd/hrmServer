"use strict";
class LeaveDate {
    constructor(year, month, date, fullday) {
        const now = new Date();
        this.year = typeof year === 'number' ? year : now.getFullYear();
        this.month = typeof month === 'number' ? month : now.getMonth();
        this.date = typeof date === 'number' ? date : now.getDate();
        this.fullday = fullday || false;
    }
    static fromString(string) {
        const ld = new LeaveDate();
        const test = /^(?<date>\d{2})-(?<month>\d{2})-(?<year>\d{4})-(?<fullday>\d)$/.exec(string);
        if (!test || !test.groups)
            throw Error("Invalid String, should be in the format dd-mm-yyyy-f, got: " + string);
        ld.date = parseInt(test.groups.date);
        ld.month = parseInt(test.groups.month) - 1;
        ld.year = parseInt(test.groups.year);
        ld.fullday = test.groups.fullday === '1';
        return ld;
    }
    static fromInput(dateInput, fullday) {
        const test = /^(?<year>\d{4})-(?<month>\d{2})-(?<date>\d{2})$/.exec(dateInput);
        const ld = new LeaveDate();
        if (!test || !test.groups)
            throw Error("Invalid Input String, should be in the format yyyy-mm-dd, got: " + dateInput);
        ld.date = parseInt(test.groups.date);
        ld.month = parseInt(test.groups.month) - 1;
        ld.year = parseInt(test.groups.year);
        ld.fullday = fullday === '1';
        return ld;
    }
    static fromDatestamp(ds) {
        const d = new Date(ds * 24 * 3600 * 1000);
        const ld = new LeaveDate();
        ld.date = d.getDate();
        ld.month = d.getMonth();
        ld.year = d.getFullYear();
        ld.fullday = true;
        return ld;
    }
    dateFormat(showYear) {
        return this.date + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][this.month] + (showYear ? ' ' + this.year : '');
    }
    timeFormat(isEnd) {
        return this.fullday ? isEnd ? 'Evening' : 'Morning' : 'Noon';
    }
    encode() {
        return `${(this.date + '').padStart(2, "0")}-${((this.month + 1) + '').padStart(2, "0")}-${(this.year + '').padStart(4, "0")}-${this.fullday ? '1' : '0'}`;
    }
    toString() {
        return this.encode();
    }
    getDatestamp() {
        return Date.UTC(this.year, this.month, this.date) / 1000 / 3600 / 24;
        //return new Date(`${this.year}-${((this.month+1)+'').padStart(2,'0')}, ${(this.date+'').padStart(2,'0')}Z`).getTime()/1000/3600/24
    }
    getMy() {
        return this.year * 12 + this.month;
    }
}
if (typeof module === 'object') {
    console.log('module!');
    module.exports = LeaveDate;
}
