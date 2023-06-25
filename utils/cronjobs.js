const LeaveManager = require('./leaveManager')
exports.cronjobs = [
	{
		job: LeaveManager.checker,
		period: '0 0 1 * *'
	},
	{
		job: LeaveManager.lateChecker,
		period: '0 9 * * *'
	},
	{
		job: async() => {
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			await LeaveManager.attendanceChecker(today)
			await LeaveManager.attendanceChecker(new Date(today.getTime() + 24*3600000));
			await LeaveManager.lateChecker();
		},
		period: '0 0 * * *'
	},
]

exports.init = async() => {
	const now = new Date();
	console.log('executing cron jobs', now.toISOString())
	await LeaveManager.checker();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	await LeaveManager.attendanceChecker(today)
	await LeaveManager.attendanceChecker(new Date(today.getTime() + 24*3600000));
	await LeaveManager.lateChecker();
};