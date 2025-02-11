import {ActionHandler} from "./action_handler.js";
import {ActionResponse} from "./action_response.js";
import {Model} from "../../../../../../utils/util/model.js";

class ActionWrapper implements Model, ActionHandler{

	private data: Array<ActionResponse>;
	private info: Map<string, any>;
	private keyModified: Map<string, number> = new Map<string, number>();
	/**
	 * The method to get the data
	 * @returns An Array representing the data
	 */
	public getData(): Array<ActionResponse>	{
		return this.data;

	}

	/**
	 * The method to set the value to data
	 * @param data An Array representing the data
	 */
	public setData(data: Array<ActionResponse>): void	{
		this.data = data;
		this.keyModified.set("data", 1);

	}

	/**
	 * The method to get the info
	 * @returns A Map representing the info
	 */
	public getInfo(): Map<string, any>	{
		return this.info;

	}

	/**
	 * The method to set the value to info
	 * @param info A Map representing the info
	 */
	public setInfo(info: Map<string, any>): void	{
		this.info = info;
		this.keyModified.set("info", 1);

	}

	/**
	 * The method to check if the user has modified the given key
	 * @param key A string representing the key
	 * @returns A number representing the modification
	 */
	public isKeyModified(key: string): number | null | undefined	{
		if(this.keyModified.has(key))	{
			return this.keyModified.get(key);
		}
		return null;

	}

	/**
	 * The method to mark the given key as modified
	 * @param key A string representing the key
	 * @param modification A number representing the modification
	 */
	public setKeyModified(key: string, modification: number): void	{
		this.keyModified.set(key, modification);

	}

}
export {
	ActionWrapper as MasterModel,
	ActionWrapper as ActionWrapper
}
