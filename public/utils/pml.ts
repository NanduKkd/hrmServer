interface PMLDocument {
	person: string;
	month: number;
	year: number;

	carrySL: number;
	carryCL: number;
	carryPL: number;
	carryCompensatory: number;

	earnedSL: number;
	earnedCL: number;
	earnedPL: number;
	earnedCompensatory: number;

	takenSL: number;
	takenCL: number;
	takenPL: number;
}

class Pml {
	person: string;
	month: number;
	year: number;
	my: number;

	carrySL: number;
	carryCL: number;
	carryPL: number;
	carryCompensatory: number;

	earnedSL: number;
	earnedCL: number;
	earnedPL: number;
	earnedCompensatory: number;

	takenSL: number;
	takenCL: number;
	takenPL: number;
	constructor(data: PMLDocument) {
		this.person = data.person;
		this.month = data.month;
		this.year = data.year;
		this.my = data.year*12 + data.month;


		this.carrySL = data.carrySL;
		this.carryPL = data.carryPL;
		this.carryCL = data.carryCL;
		this.carryCompensatory = data.carryCompensatory;

		this.earnedSL = data.earnedSL;
		this.earnedPL = data.earnedPL;
		this.earnedCL = data.earnedCL;
		this.earnedCompensatory = data.earnedCompensatory;

		this.takenSL = data.takenSL;
		this.takenPL = data.takenPL;
		this.takenCL = data.takenCL;
	}
	available(type: 'C/L' | 'P/L' | 'S/L'): number {
		return Math.max(0, this.earned(type)+this.carry(type)-this.taken(type))
	}
	taken(type: 'C/L' | 'P/L' | 'S/L'): number {
		if(type==='C/L')
			return this.takenCL
		else if(type==='P/L')
			return this.takenPL
		else if(type==='S/L')
			return this.takenSL
		else
			throw new Error("Unknown Leave Type")
	}
	earned(type: 'C/L' | 'P/L' | 'S/L'): number {
		if(type==='C/L')
			return this.earnedCL+this.earnedCompensatory
		else if(type==='P/L')
			return this.earnedPL
		else if(type==='S/L')
			return this.earnedSL
		else
			throw new Error("Unknown Leave Type")
	}
	carry(type: 'C/L' | 'P/L' | 'S/L'): number {
		if(type==='C/L')
			return this.carryCL+this.carryCompensatory
		else if(type==='P/L')
			return this.carryPL
		else if(type==='S/L')
			return this.carrySL
		else
			throw new Error("Unknown Leave Type")
	}
	static earnedFromData(data: PMLDocument, type: 'P/L' | 'C/L' | 'S/L'): number {
		const pml = new Pml(data)
		return pml.earned(type)
	}
	static takenFromData(data: PMLDocument, type: 'P/L' | 'C/L' | 'S/L'): number {
		const pml = new Pml(data)
		return pml.taken(type)
	}
	static carryFromData(data: PMLDocument, type: 'P/L' | 'C/L' | 'S/L'): number {
		const pml = new Pml(data)
		return pml.carry(type)
	}
	static availableFromData(data: PMLDocument, type: 'P/L' | 'C/L' | 'S/L'): number {
		const pml = new Pml(data)
		return pml.available(type)
	}
}

if(typeof module === 'object') {
	console.log('module!')
	module.exports = Pml
}
