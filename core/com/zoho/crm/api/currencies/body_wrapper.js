"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyWrapper = exports.MasterModel = void 0;
class BodyWrapper {
    constructor() {
        this.keyModified = new Map();
    }
    /**
     * The method to get the currencies
     * @returns An Array representing the currencies
     */
    getCurrencies() {
        return this.currencies;
    }
    /**
     * The method to set the value to currencies
     * @param currencies An Array representing the currencies
     */
    setCurrencies(currencies) {
        this.currencies = currencies;
        this.keyModified.set("currencies", 1);
    }
    /**
     * The method to check if the user has modified the given key
     * @param key A string representing the key
     * @returns A number representing the modification
     */
    isKeyModified(key) {
        if (this.keyModified.has(key)) {
            return this.keyModified.get(key);
        }
        return null;
    }
    /**
     * The method to mark the given key as modified
     * @param key A string representing the key
     * @param modification A number representing the modification
     */
    setKeyModified(key, modification) {
        this.keyModified.set(key, modification);
    }
}
exports.MasterModel = BodyWrapper;
exports.BodyWrapper = BodyWrapper;
//# sourceMappingURL=body_wrapper.js.map