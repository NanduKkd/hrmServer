"use strict";
function labelReportData(item) {
    if ((item.sunday || item.holiday) && item.attendance)
        return (item.sunday ? 'Sunday' : 'Holiday') + ' (Compensatory)';
    else if ((item.sunday || item.holiday) && item.leave && item.leave.type === 'P/L')
        return (item.sunday ? 'Sunday' : 'Holiday') + ' (P/L)';
    else if (item.holiday)
        return 'Holiday';
    else if (item.sunday)
        return 'Sunday';
    else if (item.leave)
        return `Leave (${item.leave.type}${item.leave.status === 'lop' ? ', LoP' : ''})`;
    else if (item.attendance)
        return `Attended`;
    else if (item.na)
        return '-';
    else if (!Object.keys(item).length)
        return 'LoP';
    else {
        console.log(JSON.stringify(item));
        return 'Unknown';
    }
}
function showPersonReport() {
    const now = new Date();
    myfetch('attendance/personalreport/' + now.getFullYear() + '/' + ((now.getMonth() + 1) + '').padStart(2, '0') + '/' + profileView.dataset.person).then(res => {
        if (!(res.data instanceof Array))
            return showError();
        fillBoxTable('Employee Attendance Report (' + now.getFullYear() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()] + ')', [
            { label: "Date" },
            { label: "Morning" },
            { label: "Evening" },
        ], res.data.map((i, ii) => [
            { label: (ii + 1) + '' },
            { label: labelReportData(i[0]) },
            { label: labelReportData(i[1]) },
        ]));
        showBoxTable(true);
    });
}
