type attendanceStatus = {status: 'ready'}
	| {status: 'empty', reason?: string}
	| {status: 'open', warning?: boolean};


function initAttendance() {
	attendanceMarker = document.getElementById('attendanceMarker') as HTMLDivElement;
	attendanceLabel = attendanceMarker.querySelector('.label') as HTMLDivElement;
	if(!navigator.geolocation) {
		attendanceMarker.classList.remove('open', 'close');
		attendanceLabel.classList.add('warning')
		attendanceLabel.innerText = "Location not supported in your browser."
		return;
	}
	myfetch('attendance/status').then(res => {
		const data = res.data as attendanceStatus;
		if(data.status==='ready') {
			showOpenAttendance();
		} else if(data.status==='empty') {
			showAttendanceStatus(data.reason);
		} else {
			showCloseAttendance(data.warning);
		}
	})
}

function showOpenAttendance() {
	attendanceMarkerStyle('open', null, '')
}

function showCloseAttendance(warning?: boolean) {
	attendanceMarkerStyle('close', 'warning', warning?'Please mark exit if you have exted work':'')
}

function showAttendanceStatus(reason?: string) {
	attendanceMarkerStyle(
		null,
		reason==='late'?'warning':reason==='marked'?'success':null,
		reason==='leave'
			?'You are on leave'
			:reason==='late'
				?'You are late'
				:reason==='marked'
					?'Attendance marked today.'
					:reason==='early'
						?'Too early'
						:''
	)
}

function attendanceMarkerStyle(type: 'open'|'close'|null, labelType: 'warning'|'success'|null, labelMessage: string) {
	attendanceMarker.classList.remove('loading');
	attendanceMarker.classList.toggle('close', type==='close');
	attendanceMarker.classList.toggle('open', type==='open');
	attendanceLabel.classList.toggle('warning', labelType==='warning')
	attendanceLabel.classList.toggle('success', labelType==='success')
	attendanceLabel.innerText = labelMessage;
}

async function attendanceResponse(target: HTMLButtonElement) {
	attendanceMarker.classList.add('loading');
	if(target.dataset.action==='open') {
		try {
			await new Promise(res => setTimeout(res, 3000));
			const location = await getGeolocation()
			await myfetch('attendance/entry/'+location.coords.latitude+'/'+location.coords.longitude+'/'+location.coords.accuracy, {method: 'POST'});
			showCloseAttendance();
		} catch (e: any) {
			console.error(e);
			attendanceMarker.classList.remove('loading');
			if(e instanceof GeolocationPositionError){
				alert("Could not access your location. We cannot mark entry without your location.")
			}
			alert("Sending error")
			sendError(e.message).then(() => {}).catch(e => {})
		}
	} else {
		await myfetch('attendance/exit', {method: 'PATCH'})
		showAttendanceStatus('marked')
	}
}

function getGeolocation(): Promise<GeolocationPosition> {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	})
}