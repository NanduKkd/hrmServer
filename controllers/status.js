const path = require('path')
const fs = require('fs/promises')


function formatLine(line='') {
	line = line.replace(/@[a-z]+?\(\d{2}-\d{2}-\d{2} \d{2}:\d{2}\)/g, (match) => `<span class="blur notimp">${match}</span>`)
	return line;
}
function format(text) {
	const lines = text instanceof Array?text:text.split('\n');
	let out = '';
	let tasks = 0, completed = 0;
	let group = [];
	let lastHeader = null;
	for(let line of lines) {
		if(!line) continue;
		if(line.at(0)==='\t') group.push(line.substring(1))
		else {
			if(group.length) {
				const gr = format(group);
				tasks += gr.tasks;
				completed += gr.completed;
				if(lastHeader) {
					out += `<div class="header line">${lastHeader} <span class="blur"> (${gr.completed}/${gr.tasks}, ${Math.floor(gr.completed/gr.tasks*100)}%)</span></div>`;
					lastHeader = null;
				}
				out += `<div class="group">${gr.out}</div>`;
				group = [];
			}
			if(lastHeader) {
				out += `<div class="header line">${lastHeader}</div>`;
				lastHeader = null;
			}
			if(line.at(0)==='✔') {
				completed ++;
				tasks++;
				out += `<div class="line task done"><div class="mark">✔</div><div>${formatLine(line.substring(1))}</div></div>`
			} else if(line.at(0)==='☐') {
				tasks++;
				out += `<div class="line task todo"><div class="mark">☐</div><div>${formatLine(line.substring(1))}</div></div>`
			} else if(line.at(line.length-1)===':') lastHeader=line;//out += `<div class="header">${line}</div>`
		}
	}
	if(group.length) {
		const gr = format(group);
		tasks += gr.tasks;
		completed += gr.completed;
		if(lastHeader) {
			out += `<div class="header line">${lastHeader} <span class="blur"> (${gr.completed}/${gr.tasks}, ${Math.floor(gr.completed/gr.tasks*100)}%)</span></div>`;
			lastHeader = null;
		}
		out += `<div class="group">${gr.out}</div>`;
	}
	if(lastHeader) {
		out += `<div class="header line">${lastHeader}</div>`;
	}
	return {out, tasks, completed}
}

module.exports = async(req, res) => {
	const features = format(await fs.readFile(path.join(__dirname, '..', 'features.todo'), {encoding: 'utf8'}))
	res.send(`<html><meta content="width=device-width, initial-scale=1" name="viewport" /><link type="text/css" rel="stylesheet" href="/styletasks.css"><body><h2>Progress <span class="blur">(${features.completed}/${features.tasks}, ${Math.floor(features.completed/features.tasks*100)}%)</span></h2>${features.out}</body></html>`)
}