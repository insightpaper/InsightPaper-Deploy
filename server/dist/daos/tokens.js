"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseService_1 = require("../services/databaseService");
class TokenDao {
    /**
     * Funtion to create a token
     * @param tokenId
     * @returns
     */
    static createToken(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Tokens_CreateToken", {
                IN_tokenId: tokenId,
            });
            return result[0].length > 0;
        });
    }
    /**
     * Function to get a token by id
     * @param tokenId
     * @returns
     */
    static getTokenById(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Tokens_GetToken", {
                IN_tokenId: tokenId,
            });
            return result[0][0];
        });
    }
    /**
     * Function to use a token
     * @param tokenId
     * @returns
     */
    static useToken(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Tokens_UseToken", {
                IN_tokenId: tokenId,
            });
            return result[0].length > 0;
        });
    }
}
exports.default = TokenDao;
