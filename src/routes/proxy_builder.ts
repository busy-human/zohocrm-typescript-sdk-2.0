import { Constants } from '../utils/util/constants.js';

import { RequestProxy } from './request_proxy.js';

import { SDKException } from '../core/com/zoho/crm/api/exception/sdk_exception.js';

export class ProxyBuilder {
    private _host: string;

    private _port: number;

    private _user?: string;

    private _password?: string = "";

    public host(host: string): ProxyBuilder {
        this._host = host;

        return this;
    }

    public port(port: number): ProxyBuilder {
        this._port = port;

        return this;
    }

    public user(user?: string): ProxyBuilder {
        this._user = user;

        return this;
    }

    public password(password?: string): ProxyBuilder {
        this._password = password;

        return this;
    }

    public build(): RequestProxy {
        if (this._host == null && this._port == null) {
            throw new SDKException(Constants.MANDATORY_VALUE_ERROR, Constants.MANDATORY_KEY_ERROR, Constants.PROXY_MANDATORY_KEYS);
        }
        return new RequestProxy(this._host, this._port, this._user, this._password);
    }
}