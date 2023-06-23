const pmlModel = require('../models/pml');
const BasePMLCalculator = require('../public/utils/basepml');

async function getPml(my, person, emptyOne=false) {
	let pml;
	if(!emptyOne) {
		pml = await pmlModel.findOne({month: my%12, year: Math.floor(my/12), person})
	}
	if(!pml) return {
		person,
		month: my%12,
		year: Math.floor(my/12),
		carrySL: 0, carryCL: 0, carryPL: 0, carryCompensatory: 0,
		takenSL: 0, takenCL: 0, takenPL: 0,
		redmark: 0, earnedCompensatory: 0,
		earnedCL: 0, earnedSL: 0, earnedPL: 0,
	};
	else return pml.toObject();
}

class PMLCalculator extends BasePMLCalculator {
	static async loadData(my, person, isNew=false) {
		return new PMLCalculator(await getPml(my, person, isNew));
	}
	async nextMonth() {
		const carrys = this.nextMonthCarrys();
		this.pml = {
			...await getPml(++this.my, this.pml.person),
			...carrys
		};
	}
	setEarned(earnedPL, earnedCL, earnedSL) {
		this.pml = {...this.pml, earnedPL, earnedCL, earnedSL};
	}
	async save() {
		await pmlModel.updateOne({
			month: this.pml.month,
			year: this.pml.year,
			person: this.pml.person
		}, {$set: this.pml}, {upsert: true})
	}
}
module.exports = PMLCalculator;
