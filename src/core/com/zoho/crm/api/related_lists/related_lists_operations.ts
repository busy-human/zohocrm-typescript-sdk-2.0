import {Param} from "../../../../../../routes/param.js";
import {ResponseHandler} from "./response_handler.js";
import {SDKException} from "../exception/sdk_exception.js";
import {APIResponse} from "../../../../../../routes/controllers/api_response.js";
import {CommonAPIHandler} from "../../../../../../routes/middlewares/common_api_handler.js";
import { Constants } from "../../../../../../utils/util/constants.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

class RelatedListsOperations{

	private module?: string;
	/**
	 * Creates an instance of RelatedListsOperations with the given parameters
	 * @param module A string representing the module
	 */
	constructor(module?: string){
		this.module = module;

	}

	/**
	 * The method to get related lists
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async getRelatedLists(): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/v2/settings/related_lists");
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		await handlerInstance.addParam(new Param<string>("module", "com.zoho.crm.api.RelatedLists.GetRelatedListsParam"), this.module).catch(err => { throw err; });
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/json");

	}

	/**
	 * The method to get related list
	 * @param id A bigint representing the id
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async getRelatedList(id: bigint): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/v2/settings/related_lists/");
		apiPath = apiPath.concat(id.toString());
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_GET);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_READ);
		await handlerInstance.addParam(new Param<string>("module", "com.zoho.crm.api.RelatedLists.GetRelatedListParam"), this.module).catch(err => { throw err; });
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/json");

	}

}
class GetRelatedListsParam{

}

class GetRelatedListParam{

}

export {
	GetRelatedListsParam as GetRelatedListsParam,
	RelatedListsOperations as MasterModel,
	RelatedListsOperations as RelatedListsOperations,
	GetRelatedListParam as GetRelatedListParam
}
