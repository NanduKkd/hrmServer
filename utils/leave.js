const LeaveData = require('./leavedate');
const personModel = require('../models/person')
const leaveModel = require('../models/leave')
const mongoose = require('mongoose')

module.exports = class Leave{
	constructor(leaveData) {
		// console.lopg('new ', leaveData)
		this.fromLD = LeaveData.fromString(leaveData.period.from);
		this.toLD = LeaveData.fromString(leaveData.period.to);
		this.length = leaveData.period.length;
		this.pid = leaveData.pid;
		this.type = leaveData.type;
		this.status = leaveData.status;
	}
	generateFiltersForMonth(my, dateField='date') {
		const frommy = this.fromLD.getMy(), tomy = this.toLD.getMy();
		if(my>tomy || my < frommy) throw new Error(`Month not in leave (${frommy}≤${my}≤${tomy} is false)`);
		const dateFilters = [];
		if(my===tomy) {
			dateFilters.push({$lte: ['$'+dateField, this.toLD.date]});
		}
		if(my===frommy) {
			dateFilters.push({$gte: ['$'+dateField, this.fromLD.date]});
		}
		return dateFilters;
	}
	async getLengthInMonth(my) {
		const tomy = this.fromLD.getMy(), frommy = this.toLD.getMy();
		if(my>tomy || my < frommy) return 0;
		let len=0;
		const monthend = new Date(new Date(
			Math.floor((my+1)/12),
			(my+1)%12,
			1
		).getTime()-24*3600*1000).getDate();
		if(my===tomy) {
			len += this.toLD.date - (this.toLD.fullday?0:0.5);
		} else {
			len += monthend;
		}
		if(my===frommy) {
			len -= this.fromLD.date - (this.fromLD.fullday?1:0.5);
		}
		if(this.type!=='P/L') {
			const _ph = await personModel.aggregate([
				{$match: {_id: mongoose.Types.ObjectId(this.pid)}},
				{$project: {_id: 0, onsite: 1}},
				{$lookup: {
					from: 'holidays',
					let: {onsite: '$onsite'},
					pipeline: [
						{$match: {$expr: {$and: [
							{$eq: ['$onsite', '$$onsite']},
							{$eq: ['$month', my%12]},
							{$eq: ['$year', Math.floor(my/12)]},
							...this.generateFiltersForMonth(my)
						]}}}
					],
					as: 'holidays'}
				}
			]);
			for(let i of _ph[0].holidays) {
				if(my!==frommy || i.date!==this.fromLD.date && this.fromLD.fullday) len -= i.morning?0.5:0;
				if(my!==tomy || i.date!==this.toLD.date && this.toLD.fullday) len -= i.evening?0.5:0;
			}
		}
	
		for(let i=my===frommy?this.fromLD.date:1; i<=(my===tomy?this.toLD.date:monthend); i++) {
			const date = new Date(Math.floor(my/12), my%12, i);
			if(date.getDay()===0) {
				if(my!==frommy || i!==this.fromLD.date || this.fromLD.fullday) len -= 0.5;
				if(my!==tomy || i!==this.toLD.date || this.toLD.fullday) len -= 0.5;
			}
		}
		return len;
	}
	async isDayInLeave (ld) {
		const ds = ld.getDatestamp()
		const fromDs = this.fromLD.getDatestamp();
		const toDs = this.toLD.getDatestamp();
		if(ds<fromDs || ds>toDs)
			return {morning: false, evening: false};
		else {
			const data = {morning: false, evening: false}
			if(ds>fromDs && ds<toDs) {
				data.morning = true;
				data.evening = true;
			} else if(toDs===fromDs) {
				if(this.fromLD.fullday) data.morning = true;
				if(this.toLD.fullday) data.evening = true;
			} else if(ds===fromDs) {
				data.evening = true
				data.morning = this.fromLD.fullday
			} else {
				data.morning = true
				data.evening = this.toLD.fullday
			}
			if(this.type!=='P/L') {
				const ph = await personModel.aggregate([
					{$match: {_id: mongoose.Types.ObjectId(this.pid)}},
					{$project: {_id: 0, onsite: 1}},
					{$lookup: {
						from: 'holidays',
						let: {onsite: '$onsite'},
						pipeline: [
							{$match: {$expr: {$and: [
								{$eq: ['$onsite', '$$onsite']},
								{$eq: ['$month', ld.month]},
								{$eq: ['$year', ld.year]},
								{$eq: ['$date', ld.date]},
							]}}}
						],
						as: 'holidays'}
					}
				])
				if(ph[0].holidays.length) {
					if(ph[0].holidays[0].morning) data.morning = false;
					if(ph[0].holidays[0].evening) data.evening = false;
				}
			}
			return data;
		}
	}
	static filtersForDateInLeave (date) {
		return [
			{$lte: [
				{$dateFromString: {dateString: {$substr: ['$period.from', 0, 10]}, format: '%d-%m-%Y', timezone: '+0530'}},
				date
			]},
			{$gte: [
				{$dateFromString: {dateString: {$substr: ['$period.to', 0, 10]}, format: '%d-%m-%Y', timezone: '+0530'}},
				date
			]},
		]
	}
	static async findDayInAnyLeave (date, additionalFilters) {
		const leaves = await leaveModel.find({$expr: {$and: [
			...this.filtersForDateInPeriod(date),
			...(additionalFilters || [])
			//TODO check if status: Accepted filter is required
		]}})
		let data = {morning: false, evening: false}
		const ds = new LeaveDate(date.getFullYear(), date.getMonth(), date.getDate(), true).getDatestamp()
		for(let i of leaves) {
			const leave = new Leave(i);
			const _data = await leave.isDayInLeave(ds)
			data.morning = data.morning || _data.morning
			data.evening = data.evening || _data.evening
			if(data.morning && data.evening) return data;
		}
		return data;
	}
}