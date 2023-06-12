const body = document.querySelector('.body')
function setupPage(){
	myfetch('dashboard').then(res => {
		const infoOuter = document.getElementById('infoOuter')
		infoOuter.style.display = 'block'
		if(res.data.leaves?.length || res.data.notifications?.length) {
			infoOuter.querySelector('.empty').style.display = 'none'
		}
		for(let i of res.data.notifications) {
			if(i.message.length<100) {
				infoOuter.innerHTML += `
				<div class="info">
				<div>${formatDateTime(i.createdAt)}: <span class="highlight enlarge">${i.subject}</span></div>
				<pre style="font-family: arial; text-wrap: wrap;">${i.message}</pre>
				</div>
				`
				continue;
			}
			infoOuter.innerHTML += `
			<div class="info short">
				<div>${formatDateTime(i.createdAt)}: <span class="highlight enlarge">${i.subject}</span></div>
				<div class="shortversion" style="margin: 1em 0em;">${i.message.substring(0, 100)}...</div>
				<pre class="fullversion" style="font-family: arial; text-wrap: wrap;">${i.message}</pre>
				<div class="link" onclick="this.parentElement.classList.toggle('short');this.parentElement.classList.toggle('full');">
					<span class="shortversion">See more</span>
					<span class="fullversion">See less</span>
				</div>
			</div>
			`
		}
		for(let i of res.data.leaves) {
			const from = LeaveDate.fromString(i.period.from)
			const to = LeaveDate.fromString(i.period.to)
			const str = `
			<div class="info">
				<span class="highlight">${i.person.name} (${i.person.post.name})</span> will not be attending from <span class="highlight">${from.timeFormat()}, ${from.dateFormat()}</span> till <span class="highlight">${to.timeFormat(1)}, ${to.dateFormat()}</span>
			</div>
			`
			infoOuter.innerHTML += str
		}
	})
}

setupPage()

function formatDateTime(d) {
	d = new Date(d);
	return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad((d.getHours()%12) || 12)}:${pad(d.getMinutes())}${d.getHours()>11?'PM':'AM'}`
}

function pad(num) {
	return (num+'').padStart(2, '0')
}