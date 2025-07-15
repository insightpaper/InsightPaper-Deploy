"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/server.ts
const app_1 = __importDefault(require("./app"));
// 👇 Exportar handler compatible con Vercel
exports.default = app_1.default;
