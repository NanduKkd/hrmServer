if(typeof module==='Object') {
	const PLPerYear = 12;


	const MorningStartingHour = 9;
	const MorningStartingMinute = 30;

	const MorningEndingHour = 13;
	const MorningEndingMinute = 0;

	const EveningStartingHour = 14;
	const EveningStartingMinute = 0;

	const EveningEndingHour = 17;
	const EveningEndingMinute = 30;
} else {
	exports.PLPerYear = 12;


	exports.MorningOpening = 9.5;
	exports.MorningStart = 10;
	exports.MorningClosing = 10.5;
	exports.MorningEnd = 13;

	exports.EveningOpening = 13.5;
	exports.EveningStart = 14;
	exports.EveningClosing = 14.5;
	exports.EveningEnd = 17.5;
}
