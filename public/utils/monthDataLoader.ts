
interface MonthsLoader {
	loading?: {my: number, promise: Promise<MonthData>}[],
	loaded?: MonthData[],
	(mys: number[]): Promise<MonthData[]>,
}

const getMonths: MonthsLoader = async function(mys) {
	if(!mys.length) return [];
	if(!getMonths.loading) getMonths.loading = []
	if(!getMonths.loaded) getMonths.loaded = []

	const toRet: MonthData[] = [];
	const toGet: number[] = []
	for(let i=0; i<mys.length; i++) {
		const loadedmd = getMonths.loaded.find(j => j.my===mys[i])
		if(loadedmd) {
			toRet[i] = loadedmd;
			continue;
		}
		const loadingmdp = getMonths.loading.find(j => j.my===mys[i])
		if(loadingmdp) {
			toRet[i] = await loadingmdp.promise;
			continue;
		}
		toGet.push(mys[i]);
	}
	const mp = myfetch("leaves/monthsdata", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({mys: toGet}),
	});
	for(let i of toGet) {
		const promise: Promise<MonthData> = new Promise((res, rej) => {
			mp.then(ms => {
				let d = ms.data as MonthData[];
				const monthdata = d.find(md => md.my===i);
				if(!monthdata) throw new Error('Loaded data does not contain my '+i);
				res(monthdata);
			}).catch(rej)
		})
		getMonths.loading.push({my: i, promise});
	}
	const md = (await mp).data as MonthData[];
	setTimeout(() => {
		if(!getMonths.loading) getMonths.loading = [];
		for(let i=0; i<getMonths.loading.length; i++) {
			if(getMonths.loading[i].my in toGet) {
				getMonths.loading.splice(i, 1);
				i--;
			}
		}
	}, 10)
	getMonths.loaded.push(...md);
	for(let i=0; i<mys.length; i++) {
		if(!toRet[i]) {
			const found = md.find(j => j.my===mys[i])
			if(!found) throw new Error("my "+mys[i]+" not loaded")
			toRet[i] = found;
		}
	}
	return toRet;
}

async function getMonth(my: number) {
	return (await getMonths([my]))[0];
}