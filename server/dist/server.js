"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/server.ts
const app_1 = __importDefault(require("./app"));
const env_1 = __importDefault(require("./config/env"));
const port = Number(process.env.PORT || env_1.default.port || 3000);
app_1.default.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
});
