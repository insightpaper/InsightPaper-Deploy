"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosInstance = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = __importDefault(require("../config/env"));
const LLM_SERVER = env_1.default.llmServerUrl;
exports.axiosInstance = axios_1.default.create({
    baseURL: `${LLM_SERVER}/api/`,
    timeout: 60000,
});
