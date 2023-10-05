import {Header} from "../../../../../../routes/header.js";
import {ResponseHandler} from "./response_handler.js";
import {SDKException} from "../exception/sdk_exception.js";
import {APIResponse} from "../../../../../../routes/controllers/api_response.js";
import {CommonAPIHandler} from "../../../../../../routes/middlewares/common_api_handler.js";
import { Constants } from "../../../../../../utils/util/constants.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

class ProfilesOperations{

	private ifModifiedSince?: Date;
	/**
	 * Creates an instance of ProfilesOperations with the given parameters
	 * @param ifModifiedSince An instance of Date
	 */
	constructor(ifModifiedSince?: Date){
		this.ifModifiedSince = ifModifiedSince;

	}

	/**
	 * The method to get profiles
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async getProfiles(): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/v2/settings/profiles");
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		await handlerInstance.addHeader(new Header<Date>("If-Modified-Since", "com.zoho.crm.api.Profiles.GetProfilesHeader"), this.ifModifiedSince).catch(err => { throw err; });
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/json");

	}

	/**
	 * The method to get profile
	 * @param id A bigint representing the id
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async getProfile(id: bigint): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/v2/settings/profiles/");
		apiPath = apiPath.concat(id.toString());
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		await handlerInstance.addHeader(new Header<Date>("If-Modified-Since", "com.zoho.crm.api.Profiles.GetProfileHeader"), this.ifModifiedSince).catch(err => { throw err; });
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/json");

	}

}
class GetProfilesHeader{

}

class GetProfileHeader{

}

export {
	GetProfilesHeader as GetProfilesHeader,
	GetProfileHeader as GetProfileHeader,
	ProfilesOperations as MasterModel,
	ProfilesOperations as ProfilesOperations
}
