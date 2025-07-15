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
const jsonParser_1 = require("../utils/jsonParser");
class ModelDao {
    /**
     * Function to get all the models information
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getModels(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Models_GetModels", {
                IN_currentUserId: currentUserId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            if (!jsonString || jsonString.trim() === "") {
                return [];
            }
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
}
exports.default = ModelDao;
