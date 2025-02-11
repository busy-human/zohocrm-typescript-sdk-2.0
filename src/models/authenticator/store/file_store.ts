import * as fs from 'fs';
import { SDKException } from '../../../core/com/zoho/crm/api/exception/sdk_exception.js';
import { UserSignature } from "../../../routes/user_signature.js";
import { Constants } from "../../../utils/util/constants.js";
import { OAuthToken } from '../oauth_token.js';
import { Token } from "../token.js";
import { TokenStore } from "./token_store.js";
import { OAuthBuilder } from "../oauth_builder.js";

/**
 * This class stores the user token details to the file.
*/
export class FileStore implements TokenStore {
    private filePath: string;
    
    private headers: string[];

    /**
     * Creates an FileStore class instance with the specified parameters.
     * @param {string} filePath
    */
    constructor(filePath: string) {
        this.filePath = filePath;
        
        this.headers = [Constants.ID, Constants.USER_MAIL, Constants.CLIENT_ID, Constants.CLIENT_SECRET, Constants.REFRESH_TOKEN, Constants.ACCESS_TOKEN, Constants.GRANT_TOKEN, Constants.EXPIRY_TIME, Constants.REDIRECT_URL];
        
        if(!fs.existsSync(this.filePath) || (fs.existsSync(this.filePath) && fs.readFileSync(this.filePath, 'utf-8') === "")) {
            fs.writeFileSync(filePath, this.headers.join(), 'utf-8');
        }
    }

    async getToken(user: UserSignature, token: Token): Promise<Token | undefined> {
        var oauth = undefined;
        
        try {
            var array = fs.readFileSync(this.filePath,'utf-8').toString().split("\n");
            
            if(token instanceof OAuthToken){
                for(var i = 0; i < array.length; i++){
                    var line = array[i];
                    
                    var nextRecord = line.split(",");
                    
                    if (this.checkTokenExists(user.getName(), token, nextRecord)) {
                        token.setAccessToken(nextRecord[5]);

                        token.setExpiresIn(nextRecord[7]);

                        token.setRefreshToken(nextRecord[4]);

                        token.setId(nextRecord[0]);

                        token.setUserMail(nextRecord[1]);

                        return token;
                    }
                }
            }
        }
        catch (error) {
            throw new SDKException(Constants.TOKEN_STORE, Constants.GET_TOKEN_FILE_ERROR, null, error);
        }

        return oauth;
    }

    async saveToken(user: UserSignature, token: Token): Promise<void> {
        try {
            if (token instanceof OAuthToken) {

                token.setUserMail(user.getName());

                await this.deleteToken(token).catch(err => { throw err; });

                var data = [];

                data[0] = token.getId();

                data[1] = user.getName();

                data[2] = token.getClientId();

                data[3] = token.getClientSecret();

                data[4] = token.getRefreshToken();

                data[5] = token.getAccessToken();

                data[6] = token.getGrantToken();

                data[7] = token.getExpiresIn();

                data[8] = token.getRedirectURL();

                fs.appendFileSync(this.filePath, "\n" + data.join());
            }
        }
        catch (e) {
            throw new SDKException(Constants.TOKEN_STORE, Constants.SAVE_TOKEN_FILE_ERROR, null, e);
        }
    }

    async deleteToken(token: Token): Promise<void> {
        try {
            var array: string[] = [];
            
            array = fs.readFileSync(this.filePath,'utf-8').toString().split("\n");

            let deleted = false;
            
            if(token instanceof OAuthToken) {
                for (var i = 0; i < array.length; i++) {
                    var nextRecord = array[i].toString().split(",");
                    
                    if(this.checkTokenExists(token.getUserMail(), token, nextRecord)) {
                        array.splice(i, 1);

                        deleted = true;

                        break;// Stop searching after we found the email
                    }
                }

                // Rewrite the file if we deleted the user account details.
                if (deleted) {
                    fs.writeFileSync(this.filePath, array.join("\n"), 'utf8');
                }
            }
        }
        catch (e) {
            throw new SDKException(Constants.TOKEN_STORE, Constants.DELETE_TOKEN_FILE_ERROR, null, e);
        }
    }

    async getTokens(): Promise<Token[] | undefined> {
        try {
            var tokens = [];

            var array = fs.readFileSync(this.filePath,'utf-8').toString().split("\n");

            for (var i = 1; i < array.length; i++) {
                let allContents = array[i];

                let nextRecord = allContents.split(",");

                let grantToken = (nextRecord[6] != null && nextRecord[6].length > 0) ? nextRecord[6] : null;

                let token = new OAuthBuilder().clientId(nextRecord[2]).clientSecret(nextRecord[3]).refreshToken(nextRecord[4]).build();

                token.setId(nextRecord[0]);

                if (grantToken != null) {
                    token.setGrantToken(grantToken);
                }

                token.setUserMail(nextRecord[1]);

                token.setAccessToken(nextRecord[5]);

                token.setExpiresIn(nextRecord[7]);

                token.setRedirectURL(nextRecord[8]);

                tokens.push(token);
            }

            return tokens;
        }
        catch (error) {
            throw new SDKException(Constants.TOKEN_STORE, Constants.GET_TOKENS_FILE_ERROR, null, error);
        }
    }

    deleteTokens(): void {
        try {
            fs.writeFileSync(this.filePath, this.headers.join(), 'utf-8');
        }
        catch (error) {
            throw new SDKException(Constants.TOKEN_STORE, Constants.DELETE_TOKENS_FILE_ERROR, null, error);
        }
    }

    private checkTokenExists(email: string | undefined, token: OAuthToken, row:Array<string>): boolean {
        if (email == null) {
            throw new SDKException(Constants.USER_MAIL_NULL_ERROR, Constants.USER_MAIL_NULL_ERROR_MESSAGE);
        }

        var clientId = token.getClientId();

        var grantToken = token.getGrantToken();

        var refreshToken = token.getRefreshToken();

        var tokenCheck = grantToken != null ? grantToken === row[6] : refreshToken === row[4];

        if (row[1] === email && row[2] === clientId && tokenCheck) {
            return true;
        }

        return false;
    }

    async getTokenById(id: string, token: Token): Promise<Token | undefined> {
        var oauth = undefined;
        
        try {
            var array = fs.readFileSync(this.filePath,'utf-8').toString().split("\n");
            
            if (token instanceof OAuthToken) {

                let isRowPresent = false;

                for (var i = 0; i < array.length; i++) {
                    var allContents = array[i];

                    var nextRecord = allContents.split(",");

                    if (nextRecord[0] == id) {
                        isRowPresent = true;

                        let grantToken = (nextRecord[6] != null && nextRecord[6].length > 0) ? nextRecord[6] : null;

                        let redirectURL = (nextRecord[8] != null && nextRecord[8].length > 0) ? nextRecord[8] : null;

                        token.setClientId(nextRecord[2]);

                        token.setClientSecret(nextRecord[3]);

                        token.setRefreshToken(nextRecord[4]);

                        token.setId(id);

                        if (grantToken != null) {
                            token.setGrantToken(grantToken);
                        }

                        token.setUserMail(nextRecord[1]);

                        token.setAccessToken(nextRecord[5]);

                        token.setExpiresIn(nextRecord[7]);

                        token.setRedirectURL(redirectURL);

                        return token;
                    }
                }

                if (!isRowPresent) {
                    throw new SDKException(Constants.TOKEN_STORE, Constants.GET_TOKEN_BY_ID_FILE_ERROR);
                }
            }
        }
        catch (error) {
            throw new SDKException(Constants.TOKEN_STORE, Constants.GET_TOKEN_FILE_ERROR, null, error);
        }

        return oauth;
    }
}