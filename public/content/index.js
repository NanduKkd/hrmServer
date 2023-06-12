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
let table, newEmployeeForm, leaveForm, navbar, profileView, attendanceMarker, attendanceLabel, assigneeChanger, modal, boxTable, calendar;
let isHolidayInp;
let reasonInp, reasonLabel;
let isFulldayInp, isFulldayLabel;
let mornoreveInps, mornoreveLabels;
let persons;
function showError(err) {
    document.body.innerText = err || "Something went wrong. Please try again.";
}
function showForm(visible, form = newEmployeeForm) {
    form.style.display = visible ? 'block' : 'none';
}
function showModal(visible) {
    modal.style.display = visible ? 'flex' : 'none';
}
function getUnit() {
    const _body = document.querySelector('.body');
    return Math.max(Math.min(_body.clientHeight, _body.clientWidth) / 40, 20);
}
function changeAssignee(leaveId, onAssigneeChange) {
    showModal(true);
    assigneeChanger.style.display = 'block';
    modal.querySelector('button.submit').disabled = true;
    assigneeChanger.querySelector('select').addEventListener('change', function (event) {
        modal.querySelector('button.submit').disabled = !event.target.value;
    });
    modal.querySelector('button.submit').onclick = () => {
        assigneeChanger.style.display = 'none';
        showModal(false);
        onAssigneeChange(assigneeChanger.querySelector('select').value);
    };
    modal.querySelector('button.cancel').onclick = () => {
        assigneeChanger.style.display = 'none';
        showModal(false);
    };
}
/* TODO
function showAttendanceMarker(parts) {
    if(parts['0'] || parts['1']) {
        attendanceMarker.style.display = 'block'
        attendanceMarker.querySelector('input[name="first-half"]').disabled = !parts['0']
        attendanceMarker.querySelector('input[name="second-half"]').disabled = !parts['1']
    }
}*/
document.addEventListener('DOMContentLoaded', () => {
    table = document.getElementById('list');
    navbar = document.getElementById('nav-items');
    newEmployeeForm = document.getElementById('new-employee-form');
    leaveForm = document.getElementById('leave-form');
    profileView = document.getElementById('profile');
    attendanceMarker = document.getElementById('requestattendance');
    assigneeChanger = document.getElementById('assigneeChanger');
    modal = document.getElementById('modal');
    boxTable = document.getElementById('boxtable');
    authRoute();
    setupRouter();
});
function setupRouter() {
    if (!profile)
        return;
    const crntRoute = routes[location.pathname];
    for (let path in routes) {
        const route = routes[path];
        if (!route.isAuth
            || route.hidden.superadmin && (profile === null || profile === void 0 ? void 0 : profile.superadmin)
            || route.hidden.admin && !(profile === null || profile === void 0 ? void 0 : profile.superadmin) && (profile === null || profile === void 0 ? void 0 : profile.admin)
            || route.hidden.employee === true && !(profile === null || profile === void 0 ? void 0 : profile.superadmin) && !(profile === null || profile === void 0 ? void 0 : profile.admin)
            || typeof route.hidden.employee === 'object' && route.hidden.employee.office && !(profile === null || profile === void 0 ? void 0 : profile.onsite) && !profile.admin && !profile.superadmin
            || typeof route.hidden.employee === 'object' && route.hidden.employee.onsite && (profile === null || profile === void 0 ? void 0 : profile.onsite) && !profile.admin && !profile.superadmin) {
            continue;
        }
        const navItem = navbar.appendChild(document.createElement('div'));
        navItem.classList.add('nav-item');
        const navText = navItem.appendChild(document.createElement('div'));
        navText.classList.add('nav-item-text');
        navText.innerText = route.title;
        navItem.onclick = () => location.href = path;
        if (location.pathname === path) {
            navItem.classList.add('current');
            const svg = navItem.appendChild(document.createElement('svg'));
            svg.classList.add('nav-item-current-icon');
            svg.setAttribute('viewbox', "0 0 32 32");
            const circle = svg.appendChild(document.createElement('circle'));
            circle.setAttribute('cx', '16');
            circle.setAttribute('cy', '16');
            circle.setAttribute('r', '8');
            // navItem.appendChild('beforebegin', `<svg class="nav-item-current-icon" viewbox="0 0 32 32"><circle cx="16" cy="16" r="8"></circle></svg>`)
        }
        const sep = navbar.appendChild(document.createElement('div'));
        sep.classList.add('separator');
        //<div class="separator" data-usertype="common"></div>
    }
    const script = document.body.appendChild(document.createElement('script'));
    script.src = crntRoute.script;
    if (crntRoute.otherscript) {
        const otherscript = document.body.appendChild(document.createElement('script'));
        otherscript.src = crntRoute.otherscript;
    }
    initAttendance();
}
function editPersonForm(person) {
    setupForm().then((form) => {
        var _a, _b, _c, _d;
        form.querySelector('[name="name"]').value = person.name;
        form.email.value = person.email;
        form.admin.checked = person.admin;
        form.attendancereportingperson.disabled = person.admin;
        form.leavereportingperson.disabled = person.admin;
        form.leavereportingperson.value = ((_a = person.leavereportingperson) === null || _a === void 0 ? void 0 : _a._id) || person.leavereportingperson || '';
        form.attendancereportingperson.value = ((_b = person.attendancereportingperson) === null || _b === void 0 ? void 0 : _b._id) || person.attendancereportingperson || '';
        form.department.value = (_c = person.department) === null || _c === void 0 ? void 0 : _c._id;
        form.post.value = (_d = person.post) === null || _d === void 0 ? void 0 : _d._id;
        form.querySelector('button').innerText = "Edit Employee";
        form.data.editing = person._id;
        for (let i of form.attendancereportingperson.options)
            if (i.value === person._id)
                i.disabled = true;
        for (let i of form.leavereportingperson.options)
            if (i.value === person._id)
                i.disabled = true;
        //form.leavereportingperson.innerHTML += persons.filter(i => i._id!==profile._id).map(i => `<option value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`)
        //form.attendancereportingperson.innerHTML += persons.filter(i => i._id!==profile._id).map(i => `<option value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`)
    });
}
function setupForm() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const form = newEmployeeForm.children[0];
            form.admin.onclick = () => {
                form.leavereportingperson.disabled = form.admin.checked;
                form.attendancereportingperson.disabled = form.admin.checked;
            };
            if (form.department.options.length === 1) {
                form.department.innerHTML += (yield myfetch('departments/'))
                    .data
                    .map((i) => `<option value="${i._id}">${i.name}</option>`)
                    .join('');
            }
            if (form.post.options.length === 1) {
                form.post.innerHTML += (yield myfetch('posts/'))
                    .data
                    .map((i) => `<option value="${i._id}">${i.name}</option>`)
                    .join('');
            }
            if (form.leavereportingperson.options.length === 1) {
                if (persons) {
                    form.leavereportingperson.innerHTML += persons.map(i => `<option value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`);
                    form.attendancereportingperson.innerHTML += persons.map(i => `<option value="${i._id}">${i.name}, ${i.post.name}, ${i.department.name}</option>`);
                }
                else {
                    let reportingpersons = (yield myfetch('persons/'))
                        .data
                        .map((i) => `<option value="${i._id}">${i.name}</option>`)
                        .join('');
                    form.leavereportingperson.innerHTML += reportingpersons;
                    form.attendancereportingperson.innerHTML += reportingpersons;
                }
            }
            else {
                for (let i of form.leavereportingperson.options)
                    i.disabled = false;
                for (let i of form.attendancereportingperson.options)
                    i.disabled = false;
            }
            return form;
        }
        catch (e) {
            console.error(e);
            showError();
            throw e;
        }
    });
}
