import {ResponseHandler} from "./response_handler.js";
import {Param} from "../../../../../../routes/param.js";
import {ParameterMap} from "../../../../../../routes/parameter_map.js";
import {SDKException} from "../exception/sdk_exception.js";
import {APIResponse} from "../../../../../../routes/controllers/api_response.js";
import {CommonAPIHandler} from "../../../../../../routes/middlewares/common_api_handler.js";
import { Constants } from "../../../../../../utils/util/constants.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

class CustomViewsOperations{

	private module?: string;
	/**
	 * Creates an instance of CustomViewsOperations with the given parameters
	 * @param module A string representing the module
	 */
	constructor(module?: string){
		this.module = module;

	}

	/**
	 * The method to get custom views
	 * @param paramInstance An instance of ParameterMap
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async getCustomViews(paramInstance?: ParameterMap): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/v2/settings/custom_views");
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		await handlerInstance.addParam(new Param<string>("module", "com.zoho.crm.api.CustomViews.GetCustomViewsParam"), this.module).catch(err => { throw err; });
		handlerInstance.setParam(paramInstance);
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/json");

	}

	/**
	 * The method to get custom view
	 * @param id A bigint representing the id
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async getCustomView(id: bigint): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/v2/settings/custom_views/");
		apiPath = apiPath.concat(id.toString());
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		await handlerInstance.addParam(new Param<string>("module", "com.zoho.crm.api.CustomViews.GetCustomViewParam"), this.module).catch(err => { throw err; });
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/json");

	}

}
class GetCustomViewsParam{

	public static PAGE: Param<number> = new Param<number>("page", "com.zoho.crm.api.CustomViews.GetCustomViewsParam");
	public static PER_PAGE: Param<number> = new Param<number>("per_page", "com.zoho.crm.api.CustomViews.GetCustomViewsParam");
}

class GetCustomViewParam{

}

export {
	GetCustomViewsParam as GetCustomViewsParam,
	GetCustomViewParam as GetCustomViewParam,
	CustomViewsOperations as MasterModel,
	CustomViewsOperations as CustomViewsOperations
}
