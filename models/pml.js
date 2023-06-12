const mongoose = require('mongoose')


const personMonthLeavesSchema = new mongoose.Schema({
	month: {
		type: Number,
		required: true,
	},
	year: {
		type: Number,
		required: true,
	},
	person: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	carryCL: {
		type: Number,
		required: true,
	},
	carryPL: {
		type: Number,
		required: true,
	},
	carrySL: {
		type: Number,
		required: true,
	},
	carryCompensatory: {
		type: Number,
		required: true,
	},
	earnedPL: {
		type: Number,
		required: true,
	},
	earnedSL: {
		type: Number,
		required: true,
	},
	earnedCL: {
		type: Number,
		required: true,
	},
	earnedCompensatory: {
		type: Number,
		required: true,
	},
	takenCL: {
		type: Number,
		required: true,
	},
	takenPL: {
		type: Number,
		required: true,
	},
	takenSL: {
		type: Number,
		required: true,
	},
})

module.exports = mongoose.model("personmonthleaves", personMonthLeavesSchema, "personmonthleaves")
