"use strict";
function slBalance(slData) {
    return slData.carrySL + slData.earnedSL - slData.takenSL;
}
function plBalance(plData) {
    return plData.carryPL + plData.earnedPL - plData.takenPL;
}
function _compensatoryBalance(comp) {
    return comp.carryCompensatory + comp.earnedCompensatory - comp.redmark;
}
function _clAloneBalance(clData) {
    return clData.carryCL + clData.earnedCL - clData.takenCL;
}
function clBalance(clData) {
    return _compensatoryBalance(clData) + _clAloneBalance(clData);
}
const slLeft = (sl) => Math.max(slBalance(sl), 0);
const plLeft = (pl) => Math.max(plBalance(pl), 0);
const compensatoryLeft = (comp) => Math.max(_clAloneBalance(comp) < 0 ? _compensatoryBalance(comp) + _clAloneBalance(comp) : _compensatoryBalance(comp), 0);
const clLeft = (cl) => Math.max(_clAloneBalance(cl), 0);
function leaveBalance(pml, type) {
    switch (type) {
        case 'C/L': return clBalance(pml);
        case 'S/L': return slBalance(pml);
        case 'P/L': return plBalance(pml);
    }
}
function leavesLeft(pml, type) {
    switch (type) {
        case 'C/L': return clLeft(pml);
        case 'S/L': return slLeft(pml);
        case 'P/L': return plLeft(pml);
        case 'Compensatory': return compensatoryLeft(pml);
    }
}
function leavesCarry(pml, type) {
    switch (type) {
        case 'C/L': return pml.carryCL;
        case 'S/L': return pml.carrySL;
        case 'P/L': return pml.carryPL;
    }
}
class BasePMLCalculator {
    constructor(pml) {
        this.my = pml.month + pml.year * 12;
        this.pml = Object.assign({}, pml);
    }
    available(type) {
        return leaveBalance(this.pml, type);
    }
    left(type) {
        return leavesLeft(this.pml, type);
    }
    addCount(count, type) {
        switch (type) {
            case 'C/L':
                this.pml.takenCL += count;
                break;
            case 'S/L':
                this.pml.takenSL += count;
                break;
            case 'P/L':
                this.pml.takenPL += count;
                break;
            case 'Compensatory':
                this.pml.earnedCompensatory += count;
                break;
            case 'Redmark':
                this.pml.redmark += count;
                break;
        }
    }
    nextMonthCarrys() {
        if (this.my % 12 === 11) {
            return {
                carryCL: 0,
                carrySL: 0,
                carryCompensatory: 0,
                carryPL: Math.min(plLeft(this.pml), 12),
            };
        }
        else {
            const _comp = _compensatoryBalance(this.pml), _cl = _clAloneBalance(this.pml);
            let cl = 0, comp = 0;
            if (_comp < 0) {
                cl = Math.max(_cl, 0);
            }
            else if (_cl < 0) {
                comp = Math.max(_comp + _cl, 0);
            }
            else {
                comp = _comp;
                cl = _cl;
            }
            return {
                carryCL: cl,
                carrySL: slLeft(this.pml),
                carryCompensatory: comp,
                carryPL: Math.min(plLeft(this.pml), 12),
            };
        }
    }
    lop() {
        let lop = 0;
        const compBal = _compensatoryBalance(this.pml);
        if (compBal < 0) {
            lop += compBal;
            lop += Math.min(_clAloneBalance(this.pml), 0);
        }
        else {
            lop += Math.min(clBalance(this.pml), 0);
        }
        lop += Math.min(slBalance(this.pml), 0);
        return Math.abs(lop);
    }
}
if (typeof module === 'object') {
    module.exports = BasePMLCalculator;
}
