import {ActionResponse} from "./action_response.js";
import {FileBodyWrapper} from "./file_body_wrapper.js";
import {RequestWrapper} from "./request_wrapper.js";
import {ResponseHandler} from "./response_handler.js";
import {ResponseWrapper} from "./response_wrapper.js";
import {Header} from "../../../../../../routes/header.js";
import {HeaderMap} from "../../../../../../routes/header_map.js";
import {SDKException} from "../exception/sdk_exception.js";
import {APIResponse} from "../../../../../../routes/controllers/api_response.js";
import {CommonAPIHandler} from "../../../../../../routes/middlewares/common_api_handler.js";
import { Constants } from "../../../../../../utils/util/constants.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

class BulkWriteOperations{
	/**
	 * The method to upload file
	 * @param request An instance of FileBodyWrapper
	 * @param headerInstance An instance of HeaderMap
	 * @returns An instance of APIResponse<ActionResponse>
	 * @throws SDKException
	 */
	public async uploadFile(request: FileBodyWrapper, headerInstance?: HeaderMap): Promise<APIResponse<ActionResponse>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("https://content.zohoapis.com/crm/v2/upload");
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_POST);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_CREATE);
		handlerInstance.setContentType("multipart/form-data");
		handlerInstance.setRequest(request);
		handlerInstance.setMandatoryChecker(true);
		handlerInstance.setHeader(headerInstance);
		let ActionResponse = require.resolve("./action_response");
		return handlerInstance.apiCall<ActionResponse>(ActionResponse, "application/json");

	}

	/**
	 * The method to create bulk write job
	 * @param request An instance of RequestWrapper
	 * @returns An instance of APIResponse<ActionResponse>
	 * @throws SDKException
	 */
	public async createBulkWriteJob(request: RequestWrapper): Promise<APIResponse<ActionResponse>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/bulk/v2/write");
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_POST);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_CREATE);
		handlerInstance.setContentType("application/json");
		handlerInstance.setRequest(request);
		handlerInstance.setMandatoryChecker(true);
		let ActionResponse = require.resolve("./action_response");
		return handlerInstance.apiCall<ActionResponse>(ActionResponse, "application/json");

	}

	/**
	 * The method to get bulk write job details
	 * @param jobId A bigint representing the jobId
	 * @returns An instance of APIResponse<ResponseWrapper>
	 * @throws SDKException
	 */
	public async getBulkWriteJobDetails(jobId: bigint): Promise<APIResponse<ResponseWrapper>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/bulk/v2/write/");
		apiPath = apiPath.concat(jobId.toString());
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		let ResponseWrapper = require.resolve("./response_wrapper");
		return handlerInstance.apiCall<ResponseWrapper>(ResponseWrapper, "application/json");

	}

	/**
	 * The method to download bulk write result
	 * @param downloadUrl A string representing the downloadUrl
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async downloadBulkWriteResult(downloadUrl: string): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/");
		apiPath = apiPath.concat(downloadUrl.toString());
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/octet-stream");

	}

}
class UploadFileHeader{

	public static FEATURE: Header<string> = new Header<string>("feature", "com.zoho.crm.api.BulkWrite.UploadFileHeader");
	public static X_CRM_ORG: Header<string> = new Header<string>("X-CRM-ORG", "com.zoho.crm.api.BulkWrite.UploadFileHeader");
}

export {
	BulkWriteOperations as MasterModel,
	BulkWriteOperations as BulkWriteOperations,
	UploadFileHeader as UploadFileHeader
}
