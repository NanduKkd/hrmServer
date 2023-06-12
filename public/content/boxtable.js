"use strict";
function fillBoxTable(title, headers, data) {
    boxTable.querySelector('.title').innerText = title;
    const table = boxTable.querySelector('table');
    table.innerHTML = `
							<tr class="table-header"></tr>
							`;
    const hRow = boxTable.querySelector('tr.table-header');
    for (let i of headers) {
        hRow.innerHTML += `<th rowspan="${i.rowspan || 1}">${i.label}</th>`;
    }
    for (let row of data) {
        table.innerHTML += `<tr>
			${row.map(col => `<td rowspan="${col.rowspan || 1}">${col.label}</td>`).join('')}
		</tr>`;
    }
}
function showBoxTable(visible) {
    boxTable.style.display = visible ? 'block' : 'none';
}
