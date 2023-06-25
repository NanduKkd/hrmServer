const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2"); // CommonJS import
const client = new SESv2Client({});
const personModel = require('../models/person')
const LeaveDate = require('./leavedate')
const LeaveManager = require('./leaveManager')

async function sendMail (to, subject, message) {
	console.log(`Should be sending email to ${to}, subject: ${subject}, message: ${message.substring(0, 10)}...`)
	const input = { // SendEmailRequest
		FromEmailAddress: "nandukkd7164@gmail.com",
		FromEmailAddressIdentityArn: "arn:aws:ses:ap-south-1:730514332067:identity/nandukkd7164@gmail.com",
		Destination: { // Destination
			ToAddresses: [ // EmailAddressList
				"athulravirg@gmail.com",
			],
		},
		Content: { // EmailContent
			Simple: { // Message
				Subject: { // Content
					Data: subject, // required
					Charset: "UTF-8",
				},
				Body: { // Body
					Html: {
						Data: message, // required
						Charset: "UTF-8",
					},
				},
			},
		},
	};
	// const command = new SendEmailCommand(input);
	// await client.send(command);
}

exports.newLeave = async(employee, leave) => {
	try {
		const test = await LeaveManager.filterLeaves(leave, true)
		let toPerson, isSpecial = test.length===0;
		if(isSpecial)
			toPerson = await personModel.findOne({_id: employee.leavereportingperson}, {email: 1})
		else
			toPerson = await personModel.findOne({superadmin: true}, {email: 1})
		const fromLd = LeaveDate.fromString(leave.period.from)
		const toLd = LeaveDate.fromString(leave.period.to)
		await sendMail(toPerson.email, "New "+(isSpecial?'Special ':'')+"Leave Request from "+employee.name,
			`You have a new${isSpecial?' Special':''} leave request from employee ${employee.name}.<br><br>
Type: <b>${{'P/L': 'Privilage Leave', 'C/L': 'Casual Leave', 'S/L': 'Sick Leave'}[leave.type]}</b><br>
From: <b>${fromLd.dateFormat()}, ${fromLd.timeFormat(false)}</b><br>
To: <b>${toLd.dateFormat()}, ${toLd.timeFormat(true)}</b><br>
Length: <b>${leave.period.length}</b><br><br>
Check your <a href="http://15.207.220.26/leaverequests.html">leave requests tab</a>.
`
		)
	} catch (e) {
		console.error('Couldn\'t send email notification for leave '+leave._id)
		console.error(e)
	}
}

exports.noResponse = async(leave) => {
	try {
		const toPerson = await personModel.findOne({superadmin: true}, {email: 1})
		const fromPerson = await personModel.findOne({_id: leave.pid}, {name: 1});
		const fromLd = LeaveDate.fromString(leave.period.from)
		const toLd = LeaveDate.fromString(leave.period.to)
		await sendMail(toPerson.email, "Unresponded leave request from "+fromPerson.name,
			`Leave request from employee ${fromPerson.name} was not responded to by reporting person.<br><br>
Type: <b>${{'P/L': 'Privilage Leave', 'C/L': 'Casual Leave', 'S/L': 'Sick Leave'}[leave.type]}</b><br>
From: <b>${fromLd.dateFormat()}, ${fromLd.timeFormat(false)}</b><br>
To: <b>${toLd.dateFormat()}, ${toLd.timeFormat(true)}</b><br>
Length: <b>${leave.period.length}</b><br><br>
Check your <a href="http://15.207.220.26/specialrequests.html">leave requests tab</a>.
`
		)
	} catch (e) {
		console.error('Couldn\'t send email notification for leave '+leave._id)
		console.error(e)
	}
}
