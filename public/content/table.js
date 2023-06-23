"use strict";
function fillTable(title, fields, rows, onAdd, tbl = table) {
    tbl.querySelector('.list-title').innerText = title;
    tbl.querySelector('.list-item.list-header').innerHTML = fields.map(i => `
		<div class="list-item-column"${i.flex ? ` style="flex:${i.flex}"` : ''}>
			<div class="list-item-label">${i.name}</div>
		</div>`).join('');
    tbl.querySelector('.list-item.list-header').insertAdjacentHTML('afterend', rows === null || rows === void 0 ? void 0 : rows.map(i => (`<div class="list-item">
			${i.map(j => j.type === 'html' ? j.html : `
				<div class="list-item-column${j.onclick ? ' link' : ''}"${j.flex ? ` style="flex: ${j.flex};"` : ''}${j.onclick ? ` onclick="${j.onclick}"` : ''}>
					<div ${j.color ? `style="color: ${j.color || '#000'}"` : ''} class="list-item-label">${j.title}</div>
					${j.subtitle ? `<div class="list-item-sub-label">${j.subtitle}</div>` : ''}
				</div>
			`).join('')}
		</div>`)).join(''));
    tbl.querySelector('.add-new').style.display = onAdd ? 'block' : 'none';
    if (onAdd)
        tbl.querySelector('.add-new').onclick = onAdd;
}
function appendTable(rows, tbl = table) {
    tbl.querySelector('.add-new').parentElement.insertAdjacentHTML('beforebegin', rows === null || rows === void 0 ? void 0 : rows.map(i => (`<div class="list-item">
			${i.map(j => j.type === 'html' ? j.html : `
				<div class="list-item-column${j.onclick ? ' link' : ''}"${j.flex ? ` style="flex: ${j.flex};"` : ''}${j.onclick ? ` onclick="${j.onclick}"` : ''}>
					<div class="list-item-label">${j.title}</div>
					${j.subtitle ? `<div class="list-item-label">${j.subtitle}</div>` : ''}
				</div>
			`).join('')}
		</div>`)).join(''));
}
function showTable(visible, tbl = table) {
    tbl.style.display = visible ? 'block' : 'none';
}
