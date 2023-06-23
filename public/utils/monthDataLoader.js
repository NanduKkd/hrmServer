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
const getMonths = function (mys) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mys.length)
            return [];
        if (!getMonths.loading)
            getMonths.loading = [];
        if (!getMonths.loaded)
            getMonths.loaded = [];
        const toRet = [];
        const toGet = [];
        for (let i = 0; i < mys.length; i++) {
            const loadedmd = getMonths.loaded.find(j => j.my === mys[i]);
            if (loadedmd) {
                toRet[i] = loadedmd;
                continue;
            }
            const loadingmdp = getMonths.loading.find(j => j.my === mys[i]);
            if (loadingmdp) {
                toRet[i] = yield loadingmdp.promise;
                continue;
            }
            toGet.push(mys[i]);
        }
        const mp = myfetch("leaves/monthsdata", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mys: toGet }),
        });
        for (let i of toGet) {
            const promise = new Promise((res, rej) => {
                mp.then(ms => {
                    let d = ms.data;
                    const monthdata = d.find(md => md.my === i);
                    if (!monthdata)
                        throw new Error('Loaded data does not contain my ' + i);
                    res(monthdata);
                }).catch(rej);
            });
            getMonths.loading.push({ my: i, promise });
        }
        const md = (yield mp).data;
        setTimeout(() => {
            if (!getMonths.loading)
                getMonths.loading = [];
            for (let i = 0; i < getMonths.loading.length; i++) {
                if (getMonths.loading[i].my in toGet) {
                    getMonths.loading.splice(i, 1);
                    i--;
                }
            }
        }, 10);
        getMonths.loaded.push(...md);
        for (let i = 0; i < mys.length; i++) {
            if (!toRet[i]) {
                const found = md.find(j => j.my === mys[i]);
                if (!found)
                    throw new Error("my " + mys[i] + " not loaded");
                toRet[i] = found;
            }
        }
        return toRet;
    });
};
function getMonth(my) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield getMonths([my]))[0];
    });
}
