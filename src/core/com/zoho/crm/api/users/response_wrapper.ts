import {Info} from "./info.js";
import {ResponseHandler} from "./response_handler.js";
import {User} from "./user.js";
import {Model} from "../../../../../../utils/util/model.js";

class ResponseWrapper implements Model, ResponseHandler{

	private users: Array<User>;
	private info: Info;
	private keyModified: Map<string, number> = new Map<string, number>();
	/**
	 * The method to get the users
	 * @returns An Array representing the users
	 */
	public getUsers(): Array<User>	{
		return this.users;

	}

	/**
	 * The method to set the value to users
	 * @param users An Array representing the users
	 */
	public setUsers(users: Array<User>): void	{
		this.users = users;
		this.keyModified.set("users", 1);

	}

	/**
	 * The method to get the info
	 * @returns An instance of Info
	 */
	public getInfo(): Info	{
		return this.info;

	}

	/**
	 * The method to set the value to info
	 * @param info An instance of Info
	 */
	public setInfo(info: Info): void	{
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
	ResponseWrapper as MasterModel,
	ResponseWrapper as ResponseWrapper
}
