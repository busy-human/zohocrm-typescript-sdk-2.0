import { Header } from "../../routes/header.js";

import { Param } from "../../routes/param.js";

import { Constants } from "./constants.js";

import { DataTypeConverter } from "./datatype_converter.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * This class validates the Header and Parameter values with the type accepted by the CRM APIs.
 */
class HeaderParamValidator {
    public async validate(headerParam: Param<any> | Header<any>, value: any) {
        let name: string = headerParam.getName();

        let className: string | undefined | null = headerParam.getClassName();

        let jsonDetails: { [key: string]: any } = await this.getJSONDetails();

        if (className !== undefined && className !== null) {
            let jsonClassName: string = await this.getFileName(className);

            let typeDetail: { [key: string]: any } | null = null;

            if (jsonDetails.hasOwnProperty(jsonClassName)) {
                typeDetail = await this.getKeyJSONDetails(name, jsonDetails[jsonClassName]);
            }

            if (typeDetail !== null) {
                value = await DataTypeConverter.postConvert(value, typeDetail[Constants.TYPE]);
            }
        }

        return value;
    }

    private async getJSONDetails() {
        let Initializer = (await import("../../routes/initializer.js")).Initializer;

        if (Initializer.jsonDetails == null) {
            Initializer.jsonDetails = await Initializer.getJSON(path.join(__dirname, "..", "..", Constants.CONFIG_DIRECTORY, Constants.JSON_DETAILS_FILE_PATH));
        }

        return Initializer.jsonDetails;
    }

    private getFileName(name: string): string {
        let fileName = [];

        let spl: string[] = name.toString().split(".");

        let className: string | undefined = spl.pop();

        if (className !== undefined) {
            let nameParts = className.split(/([A-Z][a-z]+)/).filter(function (e) { return e });

            fileName.push(nameParts[0].toLowerCase());

            for (let i = 1; i < nameParts.length; i++) {
                fileName.push(nameParts[i].toLowerCase());
            }
        }

        return "core/" + spl.join("/").toLowerCase() + "/" + fileName.join("_");
    }

    private async getKeyJSONDetails(name: string, jsonDetails: { [key: string]: any }) {
        let keyArray = Array.from(Object.keys(jsonDetails));

        for (let index = 0; index < keyArray.length; index++) {
            const key = keyArray[index];

            let detail = jsonDetails[key];

            if (detail.hasOwnProperty(Constants.NAME)) {
                if (detail[Constants.NAME].toLowerCase() == name.toLowerCase()) {
                    return detail;
                }
            }
        }
    }
}

export {
    HeaderParamValidator as MasterModel,
    HeaderParamValidator as HeaderParamValidator
}