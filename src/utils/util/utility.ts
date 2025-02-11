import { SDKException } from "../../core/com/zoho/crm/api/exception/sdk_exception.js";

import { Field } from "../../core/com/zoho/crm/api/fields/field.js";

import { Module } from "../../core/com/zoho/crm/api/modules/module.js";

import { HeaderMap } from "../../routes/header_map.js";

import { Initializer } from "../../routes/initializer.js";

import { CommonAPIHandler } from "../../routes/middlewares/common_api_handler.js";

import { Constants } from "./constants.js";

import * as path from "path";

import * as fs from 'fs';

import { Converter } from "./converter.js";

import Logger from "winston";

/**
 * This class handles module field details.
*/
class Utility {
    private static apiTypeVsDataType: Map<string, string> = new Map<string, string>();

    private static apiTypeVsStructureName: Map<string, string> = new Map<string, string>();

    private static newFile: boolean = false;

    private static getModifiedModules: boolean = false;

    private static forceRefresh: boolean = false;

    private static moduleAPIName: string | null = null;

    private static apiSupportedModule: { [key: string]: any } = {};

    static async assertNotNull(value: any, errorCode: string, errorMessage: string) {
        if (value == null) {
            throw new SDKException(errorCode, errorMessage);
        }
    }

    static async fileExistsFlow(moduleAPIName: string | null, recordFieldDetailsPath: string, lastModifiedTime: number | null) {
        let recordFieldDetailsJson = Initializer.getJSON(recordFieldDetailsPath);

        let initializer = await Initializer.getInitializer();

        if (initializer.getSDKConfig().getAutoRefreshFields() == true && !this.newFile && !this.getModifiedModules && (!(recordFieldDetailsJson.hasOwnProperty(Constants.FIELDS_LAST_MODIFIED_TIME)) || this.forceRefresh || (new Date().getTime() - recordFieldDetailsJson[Constants.FIELDS_LAST_MODIFIED_TIME]) > 3600000)) {
            this.getModifiedModules = true;

            lastModifiedTime = !this.forceRefresh && recordFieldDetailsJson.hasOwnProperty(Constants.FIELDS_LAST_MODIFIED_TIME) ? recordFieldDetailsJson[Constants.FIELDS_LAST_MODIFIED_TIME] : null;

            await Utility.modifyFields(recordFieldDetailsPath, lastModifiedTime).catch(err => { throw err; });

            this.getModifiedModules = false;
        }
        else if (initializer.getSDKConfig().getAutoRefreshFields() == false && this.forceRefresh && !this.getModifiedModules) {
            this.getModifiedModules = true;

            await Utility.modifyFields(recordFieldDetailsPath, lastModifiedTime).catch(err => { throw err; });

            this.getModifiedModules = false;
        }

        recordFieldDetailsJson = Initializer.getJSON(recordFieldDetailsPath);

        if (moduleAPIName == null || (recordFieldDetailsJson.hasOwnProperty(moduleAPIName.toLowerCase()) && recordFieldDetailsJson[moduleAPIName.toLowerCase()] != null)) {
            return;
        }
        else {
            await Utility.fillDataType().catch(err => { throw err; });

            recordFieldDetailsJson[moduleAPIName.toLowerCase()] = {};

            fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));

            let fieldsDetails = await Utility.getFieldsDetails(moduleAPIName).catch(err => { throw err; });

            recordFieldDetailsJson = await Initializer.getJSON(recordFieldDetailsPath);

            recordFieldDetailsJson[moduleAPIName.toLowerCase()] = fieldsDetails;

            fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));
        }
    }

    static async verifyModuleAPIName(moduleName: string | null) {
        if (moduleName != null && Constants.DEFAULT_MODULENAME_VS_APINAME.has(moduleName.toLowerCase()) && Constants.DEFAULT_MODULENAME_VS_APINAME.get(moduleName.toLowerCase()) != null) {
            return Constants.DEFAULT_MODULENAME_VS_APINAME.get(moduleName.toLowerCase());
        }

        var recordFieldDetailsPath = await this.getFileName();

        if (moduleName != null && fs.existsSync(recordFieldDetailsPath)) {
            let fieldsJSON = Initializer.getJSON(recordFieldDetailsPath);

            if (fieldsJSON.hasOwnProperty(Constants.SDK_MODULE_METADATA) && fieldsJSON[Constants.SDK_MODULE_METADATA].hasOwnProperty(moduleName.toLowerCase())) {
                let moduleMeta = fieldsJSON[Constants.SDK_MODULE_METADATA];

                return moduleMeta[moduleName.toLowerCase()][Constants.API_NAME];
            }
        }

        return moduleName;
    }

    static async setHandlerAPIPath(moduleAPIName: string | null, handlerInstance: CommonAPIHandler | null): Promise<void> {
        if (handlerInstance == null) {
            return;
        }

        let apiPath = handlerInstance.getAPIPath();

        if (moduleAPIName != null && apiPath.toLowerCase().includes(moduleAPIName.toLowerCase())) {
            let apiPathSplit: (string | undefined)[] = apiPath.split("/");

            for (var i = 0; i < apiPathSplit.length; i++) {
                if (apiPathSplit[i] != undefined) {
                    if (apiPathSplit[i]!.toLowerCase() == moduleAPIName.toLowerCase()) {
                        apiPathSplit[i] = moduleAPIName;
                    }
                    else if (Constants.DEFAULT_MODULENAME_VS_APINAME.has(apiPathSplit[i]!.toLowerCase()) && Constants.DEFAULT_MODULENAME_VS_APINAME.get(apiPathSplit[i]!.toLowerCase()) != null) {
                        apiPathSplit[i] = Constants.DEFAULT_MODULENAME_VS_APINAME.get(apiPathSplit[i]!.toLowerCase());
                    }
                }
            }

            apiPath = apiPathSplit.join("/");

            handlerInstance.setAPIPath(apiPath);
        }
    }

    /**
     * This method to fetch field details of the current module for the current user and store the result in a JSON file.
     * @param {string} moduleAPIName - A String containing the CRM module API name.
     * @param {CommonAPIHandler} handlerInstance - A String containing CommonAPIHandler Instance.
     */
    public static async getFields(moduleAPIName: string | null, handlerInstance: CommonAPIHandler | null) {
        this.moduleAPIName = moduleAPIName;

        await this.getFieldsInfo(moduleAPIName, handlerInstance).catch(err => { throw err; });
    }

    /**
     * This method to fetch field details of the current module for the current user and store the result in a JSON file.
     * @param {string} moduleAPIName - A String containing the CRM module API name.
     * @param {CommonAPIHandler} handlerInstance - A String containing CommonAPIHandler Instance.
    */
    public static async getFieldsInfo(moduleAPIName: string | null, handlerInstance: CommonAPIHandler | null) {
        let lastModifiedTime: number | null = null;

        var recordFieldDetailsPath: string | null = null;

        try {
            if (moduleAPIName != null && await Utility.searchJSONDetails(moduleAPIName).catch(err => { throw err; }) != null) {
                return;
            }

            let initializer = await Initializer.getInitializer();

            var resourcesPath = path.join(initializer.getResourcePath(), Constants.FIELD_DETAILS_DIRECTORY);

            if (!fs.existsSync(resourcesPath)) {
                fs.mkdirSync(resourcesPath, { recursive: true });
            }

            moduleAPIName = await Utility.verifyModuleAPIName(moduleAPIName);

            await Utility.setHandlerAPIPath(moduleAPIName, handlerInstance);

            if (handlerInstance != null && handlerInstance.getModuleAPIName() == null && (moduleAPIName != null && !Constants.SKIP_MODULES.includes(moduleAPIName.toLowerCase()))) {
                return;
            }

            recordFieldDetailsPath = await this.getFileName();

            if (fs.existsSync(recordFieldDetailsPath)) {
                await Utility.fileExistsFlow(moduleAPIName, recordFieldDetailsPath, lastModifiedTime).catch(err => { throw err; });
            }
            else if (initializer.getSDKConfig().getAutoRefreshFields() == true) {
                this.newFile = true;

                await Utility.fillDataType().catch(err => { throw err; });

                this.apiSupportedModule = this.apiSupportedModule.size > 0 ? this.apiSupportedModule : await Utility.getModules(null).catch(err => { throw err; });

                let recordFieldDetailsJson = fs.existsSync(recordFieldDetailsPath) ? Initializer.getJSON(recordFieldDetailsPath) : {};

                recordFieldDetailsJson[Constants.FIELDS_LAST_MODIFIED_TIME] = new Date().getTime();

                if (Object.keys(this.apiSupportedModule).length > 0) {
                    for (let module in this.apiSupportedModule) {
                        if (!recordFieldDetailsJson.hasOwnProperty(module)) {
                            let moduleData = this.apiSupportedModule[module];

                            recordFieldDetailsJson[module] = {};

                            fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));

                            let fieldsDetails = await Utility.getFieldsDetails(moduleData[Constants.API_NAME]).catch(err => { throw err; });

                            recordFieldDetailsJson = await Initializer.getJSON(recordFieldDetailsPath);

                            recordFieldDetailsJson[module] = fieldsDetails;

                            fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));
                        }
                    }
                }

                this.newFile = false;
            }
            else if (this.forceRefresh && !this.getModifiedModules) {
                //New file - and force refresh by Users
                this.getModifiedModules = true;

                let recordFieldDetailsJson = {};

                fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));

                await Utility.modifyFields(recordFieldDetailsPath, lastModifiedTime).catch(err => { throw err; });

                this.getModifiedModules = false;
            }
            else {
                await Utility.fillDataType().catch(err => { throw err; });

                let recordFieldDetailsJson: { [key: string]: any } = {};

                if (moduleAPIName !== null) {
                    recordFieldDetailsJson[moduleAPIName.toLowerCase()] = {};

                    fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));

                    let fieldsDetails = await Utility.getFieldsDetails(moduleAPIName).catch(err => { throw err; });

                    recordFieldDetailsJson = await Initializer.getJSON(recordFieldDetailsPath);

                    recordFieldDetailsJson[moduleAPIName.toLowerCase()] = fieldsDetails;

                    fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));
                }
            }
        } catch (error) {
            if (recordFieldDetailsPath != null && fs.existsSync(recordFieldDetailsPath)) {
                try {
                    let recordFieldDetailsJson = await Initializer.getJSON(recordFieldDetailsPath);

                    if (moduleAPIName !== null && recordFieldDetailsJson.hasOwnProperty(moduleAPIName.toLowerCase())) {
                        delete recordFieldDetailsJson[moduleAPIName.toLowerCase()];
                    }

                    if (this.newFile) {
                        if (recordFieldDetailsJson.hasOwnProperty(Constants.FIELDS_LAST_MODIFIED_TIME)) {
                            delete recordFieldDetailsJson[Constants.FIELDS_LAST_MODIFIED_TIME]
                        }

                        this.newFile = false;
                    }

                    if (this.getModifiedModules || this.forceRefresh) {
                        this.getModifiedModules = false;

                        this.forceRefresh = false;

                        if (lastModifiedTime != null) {
                            recordFieldDetailsJson[Constants.FIELDS_LAST_MODIFIED_TIME] = lastModifiedTime;
                        }
                    }

                    fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));
                }
                catch (error) {
                    error = new SDKException(null, null, null, error);

                    Logger.error(Constants.EXCEPTION, error);

                    throw error;
                }
            }

            if (!(error instanceof SDKException)) {
                error = new SDKException(null, null, null, error);
            }

            Logger.error(Constants.EXCEPTION, error);

            throw error;
        }
    }

    private static async modifyFields(recordFieldDetailsPath: string, modifiedTime: number | null): Promise<void> {
        let modifiedModules = await this.getModules(modifiedTime);

        let recordFieldDetailsJson: { [key: string]: any } = await Initializer.getJSON(recordFieldDetailsPath);

        recordFieldDetailsJson[Constants.FIELDS_LAST_MODIFIED_TIME] = new Date().getTime();

        fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));

        if (Object.keys(modifiedModules).length > 0) {
            for (let module in modifiedModules) {
                if (recordFieldDetailsJson.hasOwnProperty(module.toLowerCase())) {
                    delete recordFieldDetailsJson[module];
                }
            }

            fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJson));

            for (let module in modifiedModules) {
                let moduleData = modifiedModules[module];

                await Utility.getFieldsInfo(moduleData[Constants.API_NAME], null).catch(err => { throw err; });
            }
        }
    }

    public static async deleteFields(recordFieldDetailsJson: { [key: string]: any }, module: string): Promise<void> {
        let subformModules: string[] = [];

        let fieldsJSON = recordFieldDetailsJson[module.toLowerCase()];

        for (let keyName of Object.keys(fieldsJSON)) {
            if (fieldsJSON[keyName].hasOwnProperty(Constants.SUBFORM) && fieldsJSON[keyName][Constants.SUBFORM] == true && recordFieldDetailsJson.hasOwnProperty((fieldsJSON[keyName][Constants.MODULE]).toLowerCase())) {
                subformModules.push(fieldsJSON[keyName][Constants.MODULE]);
            }
        }

        delete recordFieldDetailsJson[module.toLowerCase()];

        if (subformModules.length > 0) {
            for (let subformModule of subformModules) {
                await this.deleteFields(recordFieldDetailsJson, subformModule).catch(err => { throw err; });
            }
        }
    }

    private static async getFileName(): Promise<string> {
        let initializer = await Initializer.getInitializer();

        return path.join(initializer.getResourcePath(), Constants.FIELD_DETAILS_DIRECTORY, await Converter.getEncodedFileName());
    }

    public static async getRelatedLists(relatedModuleName: string, moduleAPIName: string, commonAPIHandler: CommonAPIHandler) {
        try {
            let isnewData: boolean = false;

            let key = (moduleAPIName + Constants.UNDERSCORE + Constants.RELATED_LISTS).toLowerCase();

            let initializer = await Initializer.getInitializer();

            let resourcesPath = path.join(initializer.getResourcePath(), Constants.FIELD_DETAILS_DIRECTORY);

            if (!fs.existsSync(resourcesPath)) {
                fs.mkdirSync(resourcesPath, { recursive: true });
            }

            var recordFieldDetailsPath = await this.getFileName();

            let recordFieldDetailsJSON: { [key: string]: any } = {};

            if (!fs.existsSync(recordFieldDetailsPath) || (fs.existsSync(recordFieldDetailsPath) && (!await Initializer.getJSON(recordFieldDetailsPath).hasOwnProperty(key) || (await Initializer.getJSON(recordFieldDetailsPath)[key] == null) || await Initializer.getJSON(recordFieldDetailsPath)[key].length <= 0))) {
                isnewData = true;

                moduleAPIName = await Utility.verifyModuleAPIName(moduleAPIName);

                let relatedListValues = await this.getRelatedListDetails(moduleAPIName).catch(err => { throw err; });

                let recordFieldDetailsJSON: { [key: string]: any } = fs.existsSync(recordFieldDetailsPath) ? await Initializer.getJSON(recordFieldDetailsPath) : {};

                recordFieldDetailsJSON[key] = relatedListValues;

                fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJSON));
            }

            recordFieldDetailsJSON = await Initializer.getJSON(recordFieldDetailsPath)

            let moduleRelatedList = recordFieldDetailsJSON.hasOwnProperty(key) ? recordFieldDetailsJSON[key] : {};

            if (!(await this.checkRelatedListExists(relatedModuleName, moduleRelatedList, commonAPIHandler).catch(err => { throw err; })) && !isnewData) {
                delete recordFieldDetailsJSON[key];

                fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(recordFieldDetailsJSON));

                await Utility.getRelatedLists(relatedModuleName, moduleAPIName, commonAPIHandler).catch(err => { throw err; });
            }
        }
        catch (error) {
            if (!(error instanceof SDKException)) {
                error = new SDKException(null, null, null, error);
            }

            Logger.error(Constants.EXCEPTION, error);

            throw error;
        }
    }

    private static async checkRelatedListExists(relatedModuleName: string, modulerelatedListArray: any[], commonAPIHandler: CommonAPIHandler): Promise<boolean> {
        for (let index = 0; index < modulerelatedListArray.length; index++) {
            const relatedListObject = modulerelatedListArray[index];

            if (relatedListObject[Constants.API_NAME] != null && relatedListObject[Constants.API_NAME].toLowerCase() == relatedModuleName.toLowerCase()) {
                if (relatedListObject[Constants.HREF].toLowerCase() == Constants.NULL_VALUE) {
                    throw new SDKException(Constants.UNSUPPORTED_IN_API, commonAPIHandler.getHttpMethod() + " " + commonAPIHandler.getAPIPath() + Constants.UNSUPPORTED_IN_API_MESSAGE);
                }

                if (relatedListObject[Constants.MODULE].toLowerCase() != Constants.NULL_VALUE) {
                    commonAPIHandler.setModuleAPIName(relatedListObject[Constants.MODULE]);

                    await Utility.getFieldsInfo(relatedListObject[Constants.MODULE], commonAPIHandler).catch(err => { throw err; });
                }

                return true;
            }
        }

        return false;
    }

    private static async getRelatedListDetails(moduleAPIName: string): Promise<any[]> {
        let RelatedListsOperations = (await import("../../core/com/zoho/crm/api/related_lists/related_lists_operations.js")).RelatedListsOperations;

        let ResponseWrapper = (await import("../../core/com/zoho/crm/api/related_lists/response_wrapper.js")).ResponseWrapper;

        let APIException = (await import("../../core/com/zoho/crm/api/related_lists/api_exception.js")).APIException;

        let relatedListArray: any[] = [];

        let response = await new RelatedListsOperations(moduleAPIName).getRelatedLists();

        if (response !== null) {
            if (response.getStatusCode() === Constants.NO_CONTENT_STATUS_CODE) {
                return relatedListArray;
            }

            let responseObject = response.getObject();

            if (responseObject !== null) {
                if (responseObject instanceof ResponseWrapper) {
                    let relatedLists = responseObject.getRelatedLists();

                    relatedLists.forEach(relatedList => {
                        let relatedListDetail: { [key: string]: any } = {};

                        relatedListDetail[Constants.API_NAME] = relatedList.getAPIName();

                        relatedListDetail[Constants.MODULE] = relatedList.getModule() != null ? relatedList.getModule() : Constants.NULL_VALUE;

                        relatedListDetail[Constants.NAME] = relatedList.getName();

                        relatedListDetail[Constants.HREF] = relatedList.getHref() != null ? relatedList.getHref() : Constants.NULL_VALUE;

                        relatedListArray.push(relatedListDetail);
                    });
                }
                else if (responseObject instanceof APIException) {
                    let errorResponse: { [key: string]: any } = {};

                    errorResponse[Constants.CODE] = responseObject.getCode().getValue();

                    errorResponse[Constants.STATUS] = responseObject.getStatus().getValue();

                    errorResponse[Constants.MESSAGE] = responseObject.getMessage().getValue();

                    throw new SDKException(Constants.API_EXCEPTION, null, errorResponse)
                }
                else {
                    let errorResponse: { [key: string]: any } = {};

                    errorResponse[Constants.CODE] = response.getStatusCode();

                    throw new SDKException(Constants.API_EXCEPTION, null, errorResponse);
                }
            }
            else {
                let errorResponse: { [key: string]: any } = {};

                errorResponse[Constants.CODE] = response.getStatusCode();

                throw new SDKException(Constants.API_EXCEPTION, null, errorResponse);
            }
        }

        return relatedListArray;
    }

    /**
     * This method is to get module field data from Zoho CRM.
     * @param {string} moduleAPIName - A String containing the CRM module API name.
     * @returns {object} An Object representing the Zoho CRM module field details.
    */
    private static async getFieldsDetails(moduleAPIName: string): Promise<any> {
        let FieldOperations = (await import("../../core/com/zoho/crm/api/fields/fields_operations.js")).FieldsOperations;

        let FieldsResponseWrapper = (await import("../../core/com/zoho/crm/api/fields/response_wrapper.js")).ResponseWrapper;

        let APIException = (await import("../../core/com/zoho/crm/api/fields/api_exception.js")).APIException;

        let response = await new FieldOperations(moduleAPIName).getFields();

        let fieldsDetails: { [key: string]: any } = {};

        if (response !== null) {
            if (response.getStatusCode() == Constants.NO_CONTENT_STATUS_CODE) {
                return fieldsDetails;
            }

            let responseObject = response.getObject();

            if (responseObject != null) {
                if (responseObject instanceof FieldsResponseWrapper) {
                    let fields: Array<Field> = responseObject.getFields();

                    for (let field of fields) {
                        let keyName = field.getAPIName();

                        if (Constants.KEYS_TO_SKIP.includes(keyName)) {
                            continue;
                        }

                        var fieldDetail: { [key: string]: any } = {};

                        await Utility.setDataType(fieldDetail, field, moduleAPIName);

                        fieldsDetails[field.getAPIName()] = fieldDetail;
                    }

                    if (Constants.INVENTORY_MODULES.includes(moduleAPIName.toLowerCase())) {
                        let fieldDetail: { [key: string]: any } = {};

                        fieldDetail[Constants.NAME] = Constants.LINE_TAX;

                        fieldDetail[Constants.TYPE] = Constants.LIST_NAMESPACE;

                        fieldDetail[Constants.STRUCTURE_NAME] = Constants.LINE_TAX_NAMESPACE;

                        fieldsDetails[Constants.LINE_TAX] = fieldDetail;
                    }

                    if (moduleAPIName.toLowerCase() == Constants.NOTES) {
                        let fieldDetail: { [key: string]: any } = {};

                        fieldDetail[Constants.NAME] = Constants.ATTACHMENTS;

                        fieldDetail[Constants.TYPE] = Constants.LIST_NAMESPACE;

                        fieldDetail[Constants.STRUCTURE_NAME] = Constants.ATTACHMENTS_NAMESPACE;

                        fieldsDetails[Constants.ATTACHMENTS] = fieldDetail;
                    }
                }
                else if (responseObject instanceof APIException) {
                    let errorResponse: { [key: string]: any } = {};

                    errorResponse[Constants.CODE] = responseObject.getCode().getValue();

                    errorResponse[Constants.STATUS] = responseObject.getStatus().getValue();

                    errorResponse[Constants.MESSAGE] = responseObject.getMessage().getValue();

                    let exception: SDKException = new SDKException(Constants.API_EXCEPTION, null, errorResponse);

                    if (this.moduleAPIName != null && this.moduleAPIName.toLowerCase() == moduleAPIName.toLowerCase()) {
                        throw exception;
                    }

                    Logger.error(Constants.API_EXCEPTION, exception);
                }
            }
            else {
                let errorResponse: { [key: string]: any } = {};

                errorResponse[Constants.CODE] = response.getStatusCode();

                throw new SDKException(Constants.API_EXCEPTION, null, errorResponse);
            }
        }

        return fieldsDetails;
    }

    public static async searchJSONDetails(key: string): Promise<any> {
        key = Constants.PACKAGE_NAMESPACE + "/record/" + key;

        var jsonDetails = Initializer.jsonDetails;

        for (let keyInJSON in jsonDetails) {
            if (keyInJSON.toLowerCase() == key.toLowerCase()) {
                let returnJSON: { [key: string]: any } = {};

                returnJSON[Constants.MODULEPACKAGENAME] = keyInJSON;

                returnJSON[Constants.MODULEDETAILS] = jsonDetails[keyInJSON];

                return returnJSON;
            }
        }

        return null;
    }

    public static async verifyPhotoSupport(moduleAPIName: string): Promise<boolean> {
        try {
            moduleAPIName = await Utility.verifyModuleAPIName(moduleAPIName);

            if (Constants.PHOTO_SUPPORTED_MODULES.includes(moduleAPIName.toLowerCase())) {
                return true;
            }

            let modules = await Utility.getModuleNames().catch(err => { throw err; });

            if (modules.hasOwnProperty(moduleAPIName.toLowerCase()) && modules[moduleAPIName.toLowerCase()] != null) {
                let moduleMetaData = modules[moduleAPIName.toLowerCase()];

                if (moduleMetaData.hasOwnProperty(Constants.GENERATED_TYPE) && moduleMetaData[Constants.GENERATED_TYPE] != Constants.GENERATED_TYPE_CUSTOM) {
                    throw new SDKException(Constants.UPLOAD_PHOTO_UNSUPPORTED_ERROR, Constants.UPLOAD_PHOTO_UNSUPPORTED_MESSAGE + moduleAPIName);
                }
            }
        }
        catch (error) {
            if (!(error instanceof SDKException)) {
                error = new SDKException(null, null, null, error);
            }

            Logger.error(Constants.EXCEPTION, error);

            throw error;
        }

        return true;
    }

    static async getModuleNames(): Promise<any> {
        let moduleData = {};

        var resourcesPath = path.join((await Initializer.getInitializer()).getResourcePath(), Constants.FIELD_DETAILS_DIRECTORY);

        if (!fs.existsSync(resourcesPath)) {
            fs.mkdirSync(resourcesPath, { recursive: true });
        }

        let recordFieldDetailsPath = await this.getFileName();

        if (!fs.existsSync(recordFieldDetailsPath)) {
            moduleData = await Utility.getModules(null).catch(err => { throw err; });

            await Utility.writeModuleMetaData(recordFieldDetailsPath, moduleData).catch(err => { throw err; });

            return moduleData;
        }
        else if (fs.existsSync(recordFieldDetailsPath)) {
            let recordFieldDetailsJson = await Initializer.getJSON(recordFieldDetailsPath);
            
            if (!recordFieldDetailsJson.hasOwnProperty(Constants.SDK_MODULE_METADATA) || (recordFieldDetailsJson.hasOwnProperty(Constants.SDK_MODULE_METADATA) && (recordFieldDetailsJson[Constants.SDK_MODULE_METADATA] == null || recordFieldDetailsJson[Constants.SDK_MODULE_METADATA] == undefined|| Object.keys(recordFieldDetailsJson[Constants.SDK_MODULE_METADATA]).length <= 0))) {
                moduleData = await Utility.getModules(null).catch(err => { throw err; }).catch(err => { throw err; });

                await Utility.writeModuleMetaData(recordFieldDetailsPath, moduleData).catch(err => { throw err; });

                return moduleData;
            }
        }

        let recordFieldDetailsJson = await Initializer.getJSON(recordFieldDetailsPath);

        return recordFieldDetailsJson[Constants.SDK_MODULE_METADATA];
    }

    static async writeModuleMetaData(recordFieldDetailsPath: string, moduleData: any): Promise<void> {
        let fieldDetailsJSON = fs.existsSync(recordFieldDetailsPath) ? await Initializer.getJSON(recordFieldDetailsPath) : {};

        fieldDetailsJSON[Constants.SDK_MODULE_METADATA] = moduleData;

        fs.writeFileSync(recordFieldDetailsPath, JSON.stringify(fieldDetailsJSON));
    }

    private static async getModules(header: number | null): Promise<any> {
        let ResponseWrapper = (await import("../../core/com/zoho/crm/api/modules/response_wrapper.js")).ResponseWrapper;

        let APIException = (await import("../../core/com/zoho/crm/api/modules/api_exception.js")).APIException;

        let ModulesOperations = (await import("../../core/com/zoho/crm/api/modules/modules_operations.js")).ModulesOperations;

        let GetModulesHeader = (await import("../../core/com/zoho/crm/api/modules/modules_operations.js")).GetModulesHeader;

        let apiNames: { [key: string]: any } = {};

        let headerMap: HeaderMap = new HeaderMap();

        if (header !== null) {
            await headerMap.add(GetModulesHeader.IF_MODIFIED_SINCE, new Date(header));
        }

        let response = await new ModulesOperations().getModules(headerMap);

        if (response !== null) {
            if ([Constants.NO_CONTENT_STATUS_CODE, Constants.NOT_MODIFIED_STATUS_CODE].includes(response.getStatusCode())) {
                return apiNames;
            }

            let responseObject = response.getObject();

            if (responseObject !== null) {
                if (responseObject instanceof ResponseWrapper) {
                    let modules: Module[] = responseObject.getModules();

                    modules.forEach(module => {
                        if (module.getAPISupported() == true) {

                            let moduleDetails: { [key: string]: any } = {};

                            moduleDetails[Constants.API_NAME] = module.getAPIName();

                            moduleDetails[Constants.GENERATED_TYPE] = module.getGeneratedType().getValue();

                            apiNames[module.getAPIName().toLowerCase()] = moduleDetails;
                        }
                    });
                }
                else if (responseObject instanceof APIException) {
                    let errorResponse: { [key: string]: any } = {};

                    errorResponse[Constants.CODE] = responseObject.getCode().getValue();

                    errorResponse[Constants.STATUS] = responseObject.getStatus().getValue();

                    errorResponse[Constants.MESSAGE] = responseObject.getMessage().getValue();

                    throw new SDKException(Constants.API_EXCEPTION, null, errorResponse);
                }
            }
            else {
                let errorResponse: { [key: string]: any } = {};

                errorResponse[Constants.CODE] = response.getStatusCode();

                throw new SDKException(Constants.API_EXCEPTION, null, errorResponse);
            }
        }

        if (header == null) {
            try {
                var resourcesPath = path.join((await Initializer.getInitializer()).getResourcePath(), Constants.FIELD_DETAILS_DIRECTORY);

                if (!fs.existsSync(resourcesPath)) {
                    fs.mkdirSync(resourcesPath, { recursive: true });
                }

                var recordFieldDetailsPath = await this.getFileName();

                await Utility.writeModuleMetaData(recordFieldDetailsPath, apiNames).catch(err => { throw err; });
            }
            catch (error) {
                if (!(error instanceof SDKException)) {
                    error = new SDKException(null, null, null, error);
                }

                Logger.error(Constants.EXCEPTION, error);

                throw error;
            }
        }

        return apiNames;
    }

    public static async refreshModules() {
        this.forceRefresh = true;

        await Utility.getFieldsInfo(null, null).catch(err => { throw err; });

        this.forceRefresh = false;
    }

    public static async getJSONObject(json: { [key: string]: any }, key: string): Promise<any> {
        let keyArray = Array.from(Object.keys(json));

        for (let keyInJSON of keyArray) {
            if (key.toLowerCase() == keyInJSON.toLowerCase()) {
                return json[keyInJSON];
            }
        }

        return null;
    }

    private static async setDataType(fieldDetail: { [key: string]: any }, field: Field, moduleAPIName: string) {
        var apiType = field.getDataType();

        var module = "";

        var keyName = field.getAPIName();

        if (field.getSystemMandatory() != null && field.getSystemMandatory() == true && !(moduleAPIName.toLowerCase() == Constants.CALLS && keyName.toLowerCase() == Constants.CALL_DURATION)) {
            fieldDetail.required = true;
        }

        if (keyName.toLowerCase() == Constants.PRODUCT_DETAILS.toLowerCase() && Constants.INVENTORY_MODULES.includes(moduleAPIName.toLowerCase())) {
            fieldDetail.name = keyName;

            fieldDetail.type = Constants.LIST_NAMESPACE;

            fieldDetail.structure_name = Constants.INVENTORY_LINE_ITEMS;

            fieldDetail[Constants.SKIP_MANDATORY] = true;

            return;
        }
        else if (keyName.toLowerCase() == Constants.PRICING_DETAILS.toLowerCase() && moduleAPIName.toLowerCase() == Constants.PRICE_BOOKS) {
            fieldDetail.name = keyName;

            fieldDetail.type = Constants.LIST_NAMESPACE;

            fieldDetail.structure_name = Constants.PRICINGDETAILS;

            fieldDetail[Constants.SKIP_MANDATORY] = true;

            return;
        }
        else if (keyName.toLowerCase() == Constants.PARTICIPANT_API_NAME.toLowerCase() && (moduleAPIName.toLowerCase() == Constants.EVENTS || moduleAPIName.toLowerCase() == Constants.ACTIVITIES)) {
            fieldDetail.name = keyName;

            fieldDetail.type = Constants.LIST_NAMESPACE;

            fieldDetail.structure_name = Constants.PARTICIPANTS;

            fieldDetail[Constants.SKIP_MANDATORY] = true;

            return;
        }
        else if (keyName.toLowerCase() == Constants.COMMENTS.toLowerCase() && (moduleAPIName.toLowerCase() == Constants.SOLUTIONS || moduleAPIName.toLowerCase() == Constants.CASES)) {
            fieldDetail.name = keyName;

            fieldDetail.type = Constants.LIST_NAMESPACE;

            fieldDetail.structure_name = Constants.COMMENT_NAMESPACE;

            fieldDetail.lookup = true;

            return;
        }
        else if (keyName.toLowerCase() == Constants.LAYOUT.toLowerCase()) {
            fieldDetail.name = keyName;

            fieldDetail.type = Constants.LAYOUT_NAMESPACE;

            fieldDetail.structure_name = Constants.LAYOUT_NAMESPACE;

            fieldDetail.lookup = true;

            return;
        }
        else if (Utility.apiTypeVsDataType.has(apiType)) {
            fieldDetail.type = Utility.apiTypeVsDataType.get(apiType);
        }
        else if (apiType.toLowerCase() == Constants.FORMULA.toLowerCase()) {
            if (field.getFormula() != null) {
                let returnType = field.getFormula().getReturnType();

                if (Utility.apiTypeVsDataType.has(returnType)) {
                    fieldDetail.type = Utility.apiTypeVsDataType.get(returnType);
                }
            }

            fieldDetail[Constants.READ_ONLY] = true;
        }
        else {
            return;
        }

        if (apiType.toLowerCase().includes(Constants.LOOKUP.toLowerCase())) {
            fieldDetail.lookup = true;
        }

        if (apiType.toLowerCase() == Constants.CONSENT_LOOKUP || apiType.toLowerCase() == Constants.OWNER_LOOKUP) {
            fieldDetail[Constants.SKIP_MANDATORY] = true;
        }

        if (Utility.apiTypeVsStructureName.has(apiType)) {
            fieldDetail.structure_name = Utility.apiTypeVsStructureName.get(apiType);
        }

        if (apiType.toLowerCase() == Constants.PICKLIST && field.getPickListValues() != null && field.getPickListValues().length > 0) {
            let values: any[] = [];

            fieldDetail.picklist = true;

            field.getPickListValues().every(x => values.push(x.getDisplayValue()));

            fieldDetail.values = values;
        }

        if (apiType.toLowerCase() == Constants.SUBFORM && field.getSubform() != null) {
            module = field.getSubform().getModule();

            fieldDetail.module = module;

            fieldDetail[Constants.SKIP_MANDATORY] = true;

            fieldDetail.subform = true;
        }

        if (apiType.toLowerCase() == Constants.LOOKUP && field.getLookup() != null) {
            module = field.getLookup().getModule();

            if (module != null && module != Constants.SE_MODULE) {
                fieldDetail.module = module;

                if (module.toLowerCase() == Constants.ACCOUNTS && !field.getCustomField()) {
                    fieldDetail[Constants.SKIP_MANDATORY] = true;
                }
            }
            else {
                module = "";
            }

            fieldDetail.lookup = true;
        }

        if (module.length > 0) {
            await Utility.getFieldsInfo(module, null).catch(err => { throw err; });
        }

        fieldDetail.name = keyName;
    }

    private static async fillDataType() {
        if (this.apiTypeVsDataType.size > 0) {
            return;
        }

        let fieldAPINamesString = ["textarea", "text", "website", "email", "phone", "mediumtext", "multiselectlookup", "profileimage", "autonumber"];

        let fieldAPINamesInteger = ["integer"];

        let fieldAPINamesBoolean = ["boolean"];

        let fieldAPINamesLong = ["long", "bigint"];

        let fieldAPINamesDouble = ["double", "percent", "lookup", "currency"];

        let fieldAPINamesFile = ["imageupload"];

        let fieldAPINamesFieldFile = ["fileupload"];

        let fieldAPINamesDateTime = ["datetime", "event_reminder"];

        let fieldAPINamesDate = ["date"];

        let fieldAPINamesLookup = ["lookup"];

        let fieldAPINamesPickList = ["picklist"];

        let fieldAPINamesMultiSelectPickList = ["multiselectpicklist"];

        let fieldAPINamesSubForm = ["subform"];

        let fieldAPINamesOwnerLookUp = ["ownerlookup", "userlookup"];

        let fieldAPINamesMultiUserLookUp = ["multiuserlookup"];

        let fieldAPINamesMultiModuleLookUp = ["multimodulelookup"];

        let fieldAPINameTaskRemindAt = ["ALARM"];

        let fieldAPINameRecurringActivity = ["RRULE"];

        let fieldAPINameReminder = ["multireminder"];

        let fieldAPINameConsentLookUp = ["consent_lookup"]

        for (let fieldAPIName of fieldAPINamesString) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.STRING_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesInteger) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.INTEGER_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesBoolean) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.BOOLEAN_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesLong) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.LONG_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesDouble) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.DOUBLE_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesFile) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.FILE_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesDateTime) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.DATETIME_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesDate) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.DATE_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesLookup) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.RECORD_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.RECORD_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesPickList) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.CHOICE_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesMultiSelectPickList) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.LIST_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.CHOICE_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesSubForm) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.LIST_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.RECORD_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesOwnerLookUp) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.USER_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.USER_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesMultiUserLookUp) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.LIST_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.USER_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesMultiModuleLookUp) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.LIST_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.MODULE_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINamesFieldFile) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.LIST_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.FIELD_FILE_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINameTaskRemindAt) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.REMINDAT_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.REMINDAT_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINameRecurringActivity) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.RECURRING_ACTIVITY_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.RECURRING_ACTIVITY_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINameReminder) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.LIST_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.REMINDER_NAMESPACE);
        }
        for (let fieldAPIName of fieldAPINameConsentLookUp) {
            Utility.apiTypeVsDataType.set(fieldAPIName, Constants.CONSENT_NAMESPACE);
            Utility.apiTypeVsStructureName.set(fieldAPIName, Constants.CONSENT_NAMESPACE);
        }
    }
}

export {
    Utility as MasterModel,
    Utility as Utility
}