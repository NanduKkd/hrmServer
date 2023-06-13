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
function initAttendance() {
    attendanceMarker = document.getElementById('attendanceMarker');
    attendanceLabel = attendanceMarker.querySelector('.label');
    if (!navigator.geolocation) {
        attendanceMarker.classList.remove('open', 'close');
        attendanceLabel.classList.add('warning');
        attendanceLabel.innerText = "Location not supported in your browser.";
        return;
    }
    myfetch('attendance/status').then(res => {
        const data = res.data;
        if (data.status === 'ready') {
            showOpenAttendance();
        }
        else if (data.status === 'empty') {
            showAttendanceStatus(data.reason);
        }
        else {
            showCloseAttendance(data.warning);
        }
    });
}
function showOpenAttendance() {
    attendanceMarkerStyle('open', null, '');
}
function showCloseAttendance(warning) {
    attendanceMarkerStyle('close', 'warning', warning ? 'Please mark exit if you have exted work' : '');
}
function showAttendanceStatus(reason) {
    attendanceMarkerStyle(null, reason === 'late' ? 'warning' : reason === 'marked' ? 'success' : null, reason === 'leave'
        ? 'You are on leave'
        : reason === 'late' ?
            'You are late'
            : reason === 'marked' ?
                'Attendance marked today.'
                : '');
}
function attendanceMarkerStyle(type, labelType, labelMessage) {
    attendanceMarker.classList.toggle('close', type === 'close');
    attendanceMarker.classList.toggle('open', type === 'open');
    attendanceLabel.classList.toggle('warning', labelType === 'warning');
    attendanceLabel.classList.toggle('success', labelType === 'success');
    attendanceLabel.innerText = labelMessage;
}
function attendanceResponse(target) {
    return __awaiter(this, void 0, void 0, function* () {
        if (target.dataset.action === 'open') {
            try {
                const location = yield getGeolocation();
                yield myfetch('attendance/entry/' + location.coords.latitude + '/' + location.coords.longitude + '/' + location.coords.accuracy, { method: 'POST' });
                showCloseAttendance();
            }
            catch (e) {
                console.error(e);
                if (e instanceof GeolocationPositionError) {
                    alert("Could not access your location. We cannot mark entry without your location.");
                }
                alert("Sending error");
                sendError(e.message).then(() => { }).catch(e => { });
            }
        }
        else {
            yield myfetch('attendance/exit', { method: 'PATCH' });
            showAttendanceStatus();
        }
    });
}
function getGeolocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}
