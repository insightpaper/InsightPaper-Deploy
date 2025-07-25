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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ValidationError_1 = require("../errors/ValidationError");
const model_1 = __importDefault(require("../daos/model"));
class ModelController {
    /**
     * Function to get all the models information
     * @param req
     * @param res
     */
    static getModels(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield model_1.default.getModels(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting all the models", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
}
exports.default = ModelController;
