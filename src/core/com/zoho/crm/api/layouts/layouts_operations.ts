import {ResponseHandler} from "./response_handler.js";
import {Param} from "../../../../../../routes/param.js";
import {SDKException} from "../exception/sdk_exception.js";
import {APIResponse} from "../../../../../../routes/controllers/api_response.js";
import {CommonAPIHandler} from "../../../../../../routes/middlewares/common_api_handler.js";
import { Constants } from "../../../../../../utils/util/constants.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

class LayoutsOperations{

	private module?: string;
	/**
	 * Creates an instance of LayoutsOperations with the given parameters
	 * @param module A string representing the module
	 */
	constructor(module?: string){
		this.module = module;

	}

	/**
	 * The method to get layouts
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async getLayouts(): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/v2/settings/layouts");
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		await handlerInstance.addParam(new Param<string>("module", "com.zoho.crm.api.Layouts.GetLayoutsParam"), this.module).catch(err => { throw err; });
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/json");

	}

	/**
	 * The method to get layout
	 * @param id A bigint representing the id
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async getLayout(id: bigint): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/v2/settings/layouts/");
		apiPath = apiPath.concat(id.toString());
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		await handlerInstance.addParam(new Param<string>("module", "com.zoho.crm.api.Layouts.GetLayoutParam"), this.module).catch(err => { throw err; });
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/json");

	}

}
class GetLayoutsParam{

}

class GetLayoutParam{

}

export {
	LayoutsOperations as MasterModel,
	LayoutsOperations as LayoutsOperations,
	GetLayoutsParam as GetLayoutsParam,
	GetLayoutParam as GetLayoutParam
}
