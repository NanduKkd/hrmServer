const leaveModel = require('../models/leave')
const personModel = require('../models/personModel')
const personMonthLeavesModel = require('../models/personmonthleaves')

exports.addMonth = async(month, year) => {
	const now = new Date(Date.UTC(year, month, 1))
	const mn = month + year*12;
	const people = await personModel.find()
	for(let person of people) {
		const pmln = await personMonthLeavesModel.findOne({
			month: month,
			year: year
		})
		if(pmln) throw new Error("Leave data for month already exists for user "+person._id)
		const pml = await personMonthLeavesModel.findOne({
			month: month<1?month+11:month-1,
			year: month<1?year-1:year
		})
		if(!pml) throw new Error('No prev month data for user '+person._id)
		const mj = person.joiningdate.getMonth()+person.joiningdate.getFullYear()*12
		const mp = mj + person.monthsprobation + (person.joiningdate.getDate()!==1?2:1);
		const newML = {
			person: person._id,
			month, year,
			//TODO
			carrySL: month===0?pml.carrySL+pml.earnedSL-pml.takenSL,
			carryCL: pml.carryCL+pml.earnedCL-pml.takenCL,
			earnedSL:mjmonth===0?12:0,
			earnedCL:month
		}
		if(mn<mp) {
			//
		}
		const personProbationEnd = Date.UTC(Math.floor(mp/12), mp%12, 1)
	}
}
