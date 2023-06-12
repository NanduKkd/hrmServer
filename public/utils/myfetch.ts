type MyFetchHeaders = {
	Authorization?: string,
	'Content-Type'?: string,
}

type fetchOptions = {
	method: 'GET' | 'get',
	headers?: MyFetchHeaders
} | {
	method: 'POST' | 'post' | 'PUT' | 'put' | 'PATCH' | 'patch' | 'DELETE' | 'delete',
	headers?: MyFetchHeaders
	body?: any
}

class MyFetchResponseError extends Error {
	status: number;
	constructor(status: number, message?: string) {
		super(message);
		this.status = status;
	}
}

interface MyFetchResponse extends Response {
	data?: any,
}

interface MyFetch {
	(path: string, options?: fetchOptions): Promise<MyFetchResponse>,
	defaults?: {
		authToken?: string,
		basePath?: string,
	},
}

const myfetch: MyFetch = async(path, options) => {
	if(!options) options = {method: 'GET'}
	if(!options.headers) options.headers = {}
	if(myfetch.defaults?.authToken) {
		options.headers.Authorization = "Bearer "+myfetch.defaults.authToken;
	}

	if(myfetch.defaults?.basePath) {
		if(myfetch.defaults.basePath.substring(myfetch.defaults.basePath.length-1)!=='/')
			myfetch.defaults.basePath += '/'
		if(path.substring(0,1)==='/')
			path = path.substring(1);
		path = myfetch.defaults.basePath + path;
	}

	try {
		const res = await fetch(path, options) as MyFetchResponse;

		if(res.status===401) {
			localStorage.removeItem('auth')
			localStorage.removeItem('profile')
			authRoute();
		}
		else if(res.status>=300)
			throw new MyFetchResponseError(res.status)
		if(res.headers.get('Content-Type')) {
			if(res.headers.get('Content-Type')?.split(';')[0]==='application/json')
				res.data = await res.json()
			else if(res.headers.get('Content-Type')?.split(';')[0]==='text/plain')
				res.data = await res.text()
		}

		return res;
	} catch (e) {
		if(e instanceof MyFetchResponseError) console.log(e.status)
		showError()
		throw e;
	}
}
myfetch.defaults = {}