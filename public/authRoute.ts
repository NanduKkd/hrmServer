interface EmployeeProfile {
	_id: string,
	name: string,
	email: string,
	admin: boolean,
	superadmin: boolean,
	post: {
		_id: string,
		name: string,
	},
	department: {
		_id: string,
		name: string,
	},
	simpleReport?: {
		lop: number,
		leaves: {
			'P/L': number,
			'S/L': number,
			'C/L': number,
		}
	},
	pml?: PMLDocument,
	attendancereportingperson?: {
		name: string,
		_id: string,
	},
	leavereportingperson?: {
		name: string,
		_id: string,
	},
	onsite: boolean,
	joiningdate: string,
	monthsprobation: number,
}

let auth: string | null;
let profile: EmployeeProfile | null;
let authInit: boolean = false;

interface NavBarRoutes {
	[index: string]: {
		title: string,
		hidden: {
			admin?: boolean,
			superadmin?: boolean,
			employee?: boolean | {
				onsite?: boolean,
				office?: boolean,
			},
		},
		isAuth: boolean,
		script: string,
		otherscript?: string,
		navbar: boolean,
	}
}

const routes: NavBarRoutes = {
	'/dashboard.html': {
		title: "Dashboard",
		hidden: {},
		isAuth: true,
		script: "/dashboard.js",
		navbar: true,
	},
	"/notifier.html": {
		title: "Notifier",
		hidden: { admin: true, employee: true },
		isAuth: true,
		script: "/notifier.js",
		navbar: true
	},
	'/leaverequests.html': {
		title: "Leave Requests",
		hidden: {},
		isAuth: true,
		script: "/leaverequests.js",
		navbar: true,
	},
	'/specialrequests.html': {
		title: "Special Requests",
		hidden: {admin: true, employee: true},
		isAuth: true,
		script: "/specialrequests.js",
		navbar: true,
	},
	"/attendancerequests.html": {
		title: "Attendance Requests",
		hidden: {},
		isAuth: true,
		script: "/attendancerequests.js",
		navbar: true,
	},
	"/myleaves.html": {
		title: "My Leaves",
		hidden: {},
		isAuth: true,
		script: "/myleaves.js",
		otherscript: "/leaveform.js",
		navbar: true,
	},
	"/reports.html": {
		title: "Reports",
		hidden: {},
		isAuth: true,
		script: "/reports.js",
		navbar: true,
	},
	"/employees.html": {
		title: "Employees",
		hidden: {},
		isAuth: true,
		script: "/employees.js",
		navbar: true,
	},
	"/onsitecalendar.html": {
		title: "On-Site Calendar",
		hidden: {
			employee: {
				office: true,
			},
		},
		isAuth: true,
		script: "/onsitecalendar.js",
		navbar: true,
	},
	"/officecalendar.html": {
		title: "Office Calendar",
		hidden: {
			employee: {
				onsite: true,
			},
		},
		isAuth: true,
		script: "/officecalendar.js",
		navbar: true,
	},
	"/structure.html": {
		title: "Structure",
		hidden: {
			employee: true,
			admin: true,
		},
		isAuth: true,
		script: "/structure.js",
		navbar: true,
	},
	"/profile.html": {
		title: "Profile",
		hidden: {},
		isAuth: true,
		script: "/profile.js",
		navbar: true,
	},
	"/auth/logout.html": {
		title: "Logout",
		hidden: {},
		isAuth: true,
		script: "/auth/logout.js",
		navbar: true,
	},
	"/auth/login.html": {
		title: "Login",
		hidden: {},
		isAuth: false,
		script: "/auth/login.js",
		navbar: false,
	},
}

function authRoute() {
	myfetch.defaults!.basePath = '/api/'
	auth = localStorage.getItem('auth')
	const route = routes[location.pathname]
	const hiddenFor = route?.hidden;
	const isAuth = route?.isAuth;
	if(auth) {
		myfetch.defaults!.authToken = auth;
		profile = JSON.parse(localStorage.getItem('profile') || 'null')
		if(!profile) {
			showError("")
			throw new Error('Auth token saved to localstorage but not profile!')
		}
		if(!route || !isAuth
			|| hiddenFor.superadmin && profile.superadmin
			|| hiddenFor.admin && !profile.superadmin && profile.admin
			|| hiddenFor.employee===true && !profile.superadmin && !profile.admin
			|| typeof hiddenFor.employee === 'object' && hiddenFor.employee.office && !profile.onsite && !profile.admin && !profile.superadmin
			|| typeof hiddenFor.employee === 'object' && hiddenFor.employee.onsite && profile.onsite && !profile.admin && !profile.superadmin
		) {
			location.replace('/dashboard.html')
		}
	} else if(isAuth || !route) {
		location.replace('/auth/login.html')
	}
	if(isAuth) {
		/*
		// These lines were used to display mini profile in header but have been removed for now:
		document.querySelector('.header-profile-title').innerText = profile.name
		document.querySelector('.header-profile-subtitle').innerText = profile.post+', '+profile.department
		*/
	}
	authInit = true
}
