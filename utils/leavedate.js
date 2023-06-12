var LeaveDate = /** @class */ (function () {
    function LeaveDate(year, month, date, fullday) {
        var now = new Date();
        this.year = typeof year === 'number' ? year : now.getFullYear();
        this.month = typeof month === 'number' ? month : now.getMonth();
        this.date = typeof date === 'number' ? date : now.getDate();
        this.fullday = fullday || false;
    }
    LeaveDate.fromString = function (string) {
        var ld = new LeaveDate();
        var test = /^(?<date>\d{2})-(?<month>\d{2})-(?<year>\d{4})-(?<fullday>\d)$/.exec(string);
        if (!test || !test.groups)
            throw Error("Invalid String, should be in the format dd-mm-yyyy-f, got: " + string);
        ld.date = parseInt(test.groups.date);
        ld.month = parseInt(test.groups.month) - 1;
        ld.year = parseInt(test.groups.year);
        ld.fullday = test.groups.fullday === '1';
        return ld;
    };
    LeaveDate.fromInput = function (dateInput, fullday) {
        var test = /^(?<year>\d{4})-(?<month>\d{2})-(?<date>\d{2})$/.exec(dateInput);
        var ld = new LeaveDate();
        if (!test || !test.groups)
            throw Error("Invalid Input String, should be in the format yyyy-mm-dd, got: " + dateInput);
        ld.date = parseInt(test.groups.date);
        ld.month = parseInt(test.groups.month) - 1;
        ld.year = parseInt(test.groups.year);
        ld.fullday = fullday === '1';
        return ld;
    };
    LeaveDate.fromDatestamp = function (ds) {
        var d = new Date(ds * 24 * 3600 * 1000);
        var ld = new LeaveDate();
        ld.date = d.getDate();
        ld.month = d.getMonth();
        ld.year = d.getFullYear();
        ld.fullday = true;
        return ld;
    };
    LeaveDate.prototype.dateFormat = function () {
        return this.date + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][this.month];
    };
    LeaveDate.prototype.timeFormat = function (isEnd) {
        return this.fullday ? isEnd ? 'Evening' : 'Morning' : 'Noon';
    };
    LeaveDate.prototype.encode = function () {
        return "".concat((this.date + '').padStart(2, "0"), "-").concat(((this.month + 1) + '').padStart(2, "0"), "-").concat((this.year + '').padStart(4, "0"), "-").concat(this.fullday ? '1' : '0');
    };
    LeaveDate.prototype.getDatestamp = function () {
        return Date.UTC(this.year, this.month, this.date) / 1000 / 3600 / 24;
        //return new Date(`${this.year}-${((this.month+1)+'').padStart(2,'0')}, ${(this.date+'').padStart(2,'0')}Z`).getTime()/1000/3600/24
    };
    LeaveDate.prototype.getMy = function () {
        return this.year * 12 + this.month;
    };
    return LeaveDate;
}());
if (typeof module === 'object') {
    console.log('module!');
    module.exports = LeaveDate;
}
