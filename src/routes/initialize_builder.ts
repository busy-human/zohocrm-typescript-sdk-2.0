import { UserSignature } from './user_signature.js';

import { Constants } from '../utils/util/constants.js';

import { Utility } from '../utils/util/utility.js';

import { SDKException } from '../core/com/zoho/crm/api/exception/sdk_exception.js';

import { Token } from '../models/authenticator/token.js';

import { TokenStore } from '../models/authenticator/store/token_store.js';

import { SDKConfig } from './sdk_config.js';

import { Environment } from '../routes/dc/environment.js';

import { Initializer } from './initializer.js';

import * as LoggerFile from './logger/logger.js';

import { Logger, Levels } from "./logger/logger.js";

import { LogBuilder } from "./logger/log_builder.js";

import { SDKConfigBuilder } from "../routes/sdk_config_builder.js";

import { FileStore } from "../models/authenticator/store/file_store.js";

import { RequestProxy } from './request_proxy.js';

import * as fs from 'fs';

import * as path from "path";

export class InitializeBuilder {
    private _environment: Environment;

    private _store: TokenStore;

    private _user: UserSignature;

    private _token: Token;

    private _resourcePath: string;

    private _requestProxy: RequestProxy | undefined;

    private _sdkConfig: SDKConfig;

    private _logger: LoggerFile.Logger;

    private errorMessage: string;

    private initializer: Initializer;

    constructor() {
        (async () => {
            this.initializer = await Initializer.getInitializer();

            this.errorMessage = (await this.initializer != null) ? Constants.SWITCH_USER_ERROR : Constants.INITIALIZATION_ERROR;

            if (this.initializer != null) {
                this._user = await this.initializer.getUser();

                this._environment = await this.initializer.getEnvironment();

                this._token = await this.initializer.getToken();

                this._sdkConfig = await this.initializer.getSDKConfig();
            }
            return this;
        })();
    }

    public async initialize() {
        await Utility.assertNotNull(this._user, this.errorMessage, Constants.USER_SIGNATURE_ERROR_MESSAGE).catch(err => { throw err; });

        await Utility.assertNotNull(this._environment, this.errorMessage, Constants.ENVIRONMENT_ERROR_MESSAGE).catch(err => { throw err; });

        await Utility.assertNotNull(this._token, this.errorMessage, Constants.TOKEN_ERROR_MESSAGE).catch(err => { throw err; });

        if (this._store == null) {
            this._store = new FileStore(path.join(__dirname, "../../../../", Constants.TOKEN_FILE));
        }

        if (this._sdkConfig == null) {
            this._sdkConfig = new SDKConfigBuilder().build();
        }

        if (this._resourcePath == null) {
            this._resourcePath = path.join(__dirname, "../../../../", '');
        }

        if (this._logger == null) {
            this._logger = new LogBuilder().level(Levels.INFO).filePath(path.join(__dirname, "../../../../", Constants.LOG_FILE_NAME)).build();
        }

        Initializer.initialize(this._user, this._environment, this._token, this._store, this._sdkConfig, this._resourcePath, this._logger, this._requestProxy);
    }

    public async switchUser() {
        await Utility.assertNotNull(Initializer.getInitializer(), Constants.SDK_UNINITIALIZATION_ERROR, Constants.SDK_UNINITIALIZATION_MESSAGE).catch(err => { throw err; });

        Initializer.switchUser(this._user, this._environment, this._token, this._sdkConfig, this._requestProxy);
    }

    public logger(logger: LoggerFile.Logger): InitializeBuilder {
        this._logger = logger;

        return this;
    }

    public token(token: Token): InitializeBuilder {
        this._token = token;

        return this;
    }

    public SDKConfig(sdkConfig: SDKConfig): InitializeBuilder {
        this._sdkConfig = sdkConfig;

        return this;
    }

    public requestProxy(requestProxy: RequestProxy): InitializeBuilder {
        this._requestProxy = requestProxy;

        return this;
    }

    public resourcePath(resourcePath: string): InitializeBuilder {
        if (resourcePath != null && !fs.statSync(resourcePath).isDirectory()) {
            throw new SDKException(this.errorMessage, Constants.RESOURCE_PATH_INVALID_ERROR_MESSAGE);
        }

        this._resourcePath = resourcePath;

        return this;
    }

    public user(user: UserSignature): InitializeBuilder {
        this._user = user;

        return this;
    }

    public store(store: TokenStore): InitializeBuilder {
        this._store = store;

        return this;
    }

    public environment(environment: Environment): InitializeBuilder {
        this._environment = environment;

        return this;
    }
}