"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class MyFetchResponseError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
const myfetch = (path, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (!options)
        options = { method: 'GET' };
    if (!options.headers)
        options.headers = {};
    if ((_a = myfetch.defaults) === null || _a === void 0 ? void 0 : _a.authToken) {
        options.headers.Authorization = "Bearer " + myfetch.defaults.authToken;
    }
    if ((_b = myfetch.defaults) === null || _b === void 0 ? void 0 : _b.basePath) {
        if (myfetch.defaults.basePath.substring(myfetch.defaults.basePath.length - 1) !== '/')
            myfetch.defaults.basePath += '/';
        if (path.substring(0, 1) === '/')
            path = path.substring(1);
        path = myfetch.defaults.basePath + path;
    }
    try {
        const res = yield fetch(path, options);
        if (res.status === 401) {
            localStorage.removeItem('auth');
            localStorage.removeItem('profile');
            authRoute();
        }
        else if (res.status >= 300)
            throw new MyFetchResponseError(res.status);
        if (res.headers.get('Content-Type')) {
            if (((_c = res.headers.get('Content-Type')) === null || _c === void 0 ? void 0 : _c.split(';')[0]) === 'application/json')
                res.data = yield res.json();
            else if (((_d = res.headers.get('Content-Type')) === null || _d === void 0 ? void 0 : _d.split(';')[0]) === 'text/plain')
                res.data = yield res.text();
        }
        return res;
    }
    catch (e) {
        if (e instanceof MyFetchResponseError)
            console.log(e.status);
        showError();
        throw e;
    }
});
myfetch.defaults = {};
