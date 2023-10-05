import {BodyWrapper} from "./body_wrapper.js";
import {ResponseHandler} from "./response_handler.js";
import {SDKException} from "../exception/sdk_exception.js";
import {APIResponse} from "../../../../../../routes/controllers/api_response.js";
import {CommonAPIHandler} from "../../../../../../routes/middlewares/common_api_handler.js";
import { Constants } from "../../../../../../utils/util/constants.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

class QueryOperations{
	/**
	 * The method to get records
	 * @param request An instance of BodyWrapper
	 * @returns An instance of APIResponse<ResponseHandler>
	 * @throws SDKException
	 */
	public async getRecords(request: BodyWrapper): Promise<APIResponse<ResponseHandler>>	{
		let handlerInstance: CommonAPIHandler = new CommonAPIHandler();
		let apiPath: string = '';
		apiPath = apiPath.concat("/crm/v2/coql");
		handlerInstance.setAPIPath(apiPath);
		handlerInstance.setHttpMethod(Constants.REQUEST_METHOD_POST);
		handlerInstance.setCategoryMethod(Constants.REQUEST_CATEGORY_CREATE);
		handlerInstance.setContentType("application/json");
		handlerInstance.setRequest(request);
		handlerInstance.setMandatoryChecker(true);
		let ResponseHandler = require.resolve("./response_handler");
		return handlerInstance.apiCall<ResponseHandler>(ResponseHandler, "application/json");

	}

}
export {
	QueryOperations as MasterModel,
	QueryOperations as QueryOperations
}
