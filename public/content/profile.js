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
function showProfile(title, person, backable = true, editable = profile === null || profile === void 0 ? void 0 : profile.admin) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        profileView.querySelector('.title').innerText = title;
        let data;
        const fields = profileView.querySelectorAll('.field-value');
        if (typeof person === 'string') {
            data = (yield myfetch('persons/' + person).then(res => res.data));
        }
        else
            data = person;
        profileView.dataset.person = data._id;
        fields[0].innerText = data.name;
        fields[1].innerText = data.superadmin ? 'Super Admin' : data.admin ? 'Admin' : 'Employee';
        fields[2].innerText = data.post.name;
        fields[3].innerText = data.department.name;
        fields[4].innerText = data.onsite ? 'On-site' : 'Office';
        const d = new Date(data.joiningdate);
        const ld = new LeaveDate(d.getFullYear(), d.getMonth(), d.getDate(), true);
        fields[5].innerText = ld.dateFormat(true);
        fields[6].innerText = ((_a = data.attendancereportingperson) === null || _a === void 0 ? void 0 : _a.name) || '-';
        fields[7].innerText = ((_b = data.leavereportingperson) === null || _b === void 0 ? void 0 : _b.name) || '-';
        fields[6].parentElement.dataset.person = ((_c = data.leavereportingperson) === null || _c === void 0 ? void 0 : _c._id) || '';
        if (data.leavereportingperson)
            fields[6].classList.add('link');
        else
            fields[6].classList.remove('link');
        fields[7].parentElement.dataset.person = ((_d = data.attendancereportingperson) === null || _d === void 0 ? void 0 : _d._id) || '';
        if (data.attendancereportingperson)
            fields[7].classList.add('link');
        else
            fields[7].classList.remove('link');
        fields[8].innerText = data.email;
        if (data.pml) {
            const cys = new PMLCalculator(data.pml).nextMonthCarrys();
            fields[9].innerText = cys.carryPL + '';
            fields[10].innerText = cys.carryCL + '';
            fields[11].innerText = cys.carrySL + '';
            fields[12].innerText = cys.carryCompensatory + '';
        }
        else {
            fields[9].innerText = '-';
            fields[10].innerText = '-';
            fields[11].innerText = '-';
            fields[12].innerText = '-';
        }
        // fields[11].innerText = data.simpleReport?.lop?data.simpleReport.lop+' days':'-'
        /*
        fields[8].innerText = data.simpleReport?.leaves?data.simpleReport.leaves['P/L']+'':'-'
        fields[9].innerText = data.simpleReport?.leaves?data.simpleReport.leaves['C/L']+'':'-'
        fields[10].innerText = data.simpleReport?.leaves?data.simpleReport.leaves['S/L']+'':'-'
        fields[11].innerText = data.simpleReport?.lop?data.simpleReport.lop+' days':'-'
        */
        if (editable) {
            // (<HTMLButtonElement> profileView.querySelector('button')).onclick = () => {editPersonForm(data);showForm(true); hideProfile()}
        }
        // (<HTMLDivElement> document.getElementById('attendanceDetails')).style.display = data.admin?'none':'block';
        profileView.querySelector('.profile-back').style.display = backable ? 'block' : 'none';
        profileView.style.display = 'block';
        profileView.querySelector('button').style.display = editable ? 'block' : 'none';
    });
}
function hideProfile() {
    profileView.style.display = 'none';
    showBoxTable(false);
}
