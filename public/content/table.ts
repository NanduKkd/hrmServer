interface TableHeader {
	flex: boolean,
	name: string,
}
type TableDetailedItem = {
	type: "detailed",
	title: string,
	flex?: number,
	subtitle?: string,
	onclick?: () => void,
}
type TableHtmlItem = {
	type: "html",
	html: string,
}
type TableItem = TableDetailedItem | TableHtmlItem
type TableRow = TableItem[]

function fillTable(title: string, fields: TableHeader[], rows: TableRow[], onAdd?: () => void, tbl=table) {
	(<HTMLDivElement> tbl.querySelector('.list-title')).innerText = title;
	(<HTMLDivElement> tbl.querySelector('.list-item.list-header')).innerHTML = fields.map(i => `
		<div class="list-item-column"${i.flex?` style="flex:${i.flex}"`:''}>
			<div class="list-item-label">${i.name}</div>
		</div>`
	).join('');
	(<HTMLDivElement> tbl.querySelector('.list-item.list-header')).insertAdjacentHTML('afterend', rows?.map(i => (
		`<div class="list-item">
			${i.map(j => j.type==='html'? j.html: `
				<div class="list-item-column${j.onclick?' link':''}"${j.flex?` style="flex: ${j.flex};"`:''}${j.onclick?` onclick="${j.onclick}"`:''}>
					<div class="list-item-label">${j.title}</div>
					${j.subtitle?`<div class="list-item-sub-label">${j.subtitle}</div>`:''}
				</div>
			`).join('')}
		</div>`
	)).join(''));
	
	(<HTMLElement> tbl.querySelector('.add-new')).style.display = onAdd?'block':'none'
	if(onAdd) (<HTMLElement> tbl.querySelector('.add-new')).onclick = onAdd
}

function appendTable(rows: TableRow[], tbl=table) {
	(<HTMLElement> (<HTMLElement> tbl.querySelector('.add-new')).parentElement).insertAdjacentHTML('beforebegin', rows?.map(i => (
		`<div class="list-item">
			${i.map(j => j.type==='html'? j.html : `
				<div class="list-item-column${j.onclick?' link':''}"${j.flex?` style="flex: ${j.flex};"`:''}${j.onclick?` onclick="${j.onclick}"`:''}>
					<div class="list-item-label">${j.title}</div>
					${j.subtitle?`<div class="list-item-label">${j.subtitle}</div>`:''}
				</div>
			`).join('')}
		</div>`
	)).join(''))
}

function showTable(visible: boolean, tbl=table) {
	tbl.style.display = visible?'block':'none'
}