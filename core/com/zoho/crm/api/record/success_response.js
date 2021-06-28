"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponse = exports.MasterModel = void 0;
class SuccessResponse {
    constructor() {
        this.keyModified = new Map();
    }
    /**
     * The method to get the status
     * @returns An instance of Choice<string>
     */
    getStatus() {
        return this.status;
    }
    /**
     * The method to set the value to status
     * @param status An instance of Choice<string>
     */
    setStatus(status) {
        this.status = status;
        this.keyModified.set("status", 1);
    }
    /**
     * The method to get the code
     * @returns An instance of Choice<string>
     */
    getCode() {
        return this.code;
    }
    /**
     * The method to set the value to code
     * @param code An instance of Choice<string>
     */
    setCode(code) {
        this.code = code;
        this.keyModified.set("code", 1);
    }
    /**
     * The method to get the duplicateField
     * @returns A string representing the duplicateField
     */
    getDuplicateField() {
        return this.duplicateField;
    }
    /**
     * The method to set the value to duplicateField
     * @param duplicateField A string representing the duplicateField
     */
    setDuplicateField(duplicateField) {
        this.duplicateField = duplicateField;
        this.keyModified.set("duplicate_field", 1);
    }
    /**
     * The method to get the action
     * @returns An instance of Choice<string>
     */
    getAction() {
        return this.action;
    }
    /**
     * The method to set the value to action
     * @param action An instance of Choice<string>
     */
    setAction(action) {
        this.action = action;
        this.keyModified.set("action", 1);
    }
    /**
     * The method to get the message
     * @returns An instance of Choice<string>
     */
    getMessage() {
        return this.message;
    }
    /**
     * The method to set the value to message
     * @param message An instance of Choice<string>
     */
    setMessage(message) {
        this.message = message;
        this.keyModified.set("message", 1);
    }
    /**
     * The method to get the details
     * @returns A Map representing the details
     */
    getDetails() {
        return this.details;
    }
    /**
     * The method to set the value to details
     * @param details A Map representing the details
     */
    setDetails(details) {
        this.details = details;
        this.keyModified.set("details", 1);
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
exports.MasterModel = SuccessResponse;
exports.SuccessResponse = SuccessResponse;
//# sourceMappingURL=success_response.js.map