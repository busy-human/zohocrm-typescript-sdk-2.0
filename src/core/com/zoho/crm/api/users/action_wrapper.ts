import {ActionHandler} from "./action_handler.js";
import {ActionResponse} from "./action_response.js";
import {Model} from "../../../../../../utils/util/model.js";

class ActionWrapper implements Model, ActionHandler{

	private users: Array<ActionResponse>;
	private keyModified: Map<string, number> = new Map<string, number>();
	/**
	 * The method to get the users
	 * @returns An Array representing the users
	 */
	public getUsers(): Array<ActionResponse>	{
		return this.users;

	}

	/**
	 * The method to set the value to users
	 * @param users An Array representing the users
	 */
	public setUsers(users: Array<ActionResponse>): void	{
		this.users = users;
		this.keyModified.set("users", 1);

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
