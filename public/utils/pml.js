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
class PMLCalculator extends BasePMLCalculator {
    static loadData(my) {
        return __awaiter(this, void 0, void 0, function* () {
            return new PMLCalculator((yield getMonth(my)).pml);
        });
    }
    nextMonth() {
        return __awaiter(this, void 0, void 0, function* () {
            const carrys = this.nextMonthCarrys();
            this.pml = Object.assign(Object.assign({}, (yield getMonth(++this.my)).pml), carrys);
        });
    }
}
