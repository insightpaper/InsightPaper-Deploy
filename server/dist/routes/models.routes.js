"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const model_1 = __importDefault(require("../controllers/model"));
const router = (0, express_1.Router)();
router.get("/", model_1.default.getModels);
exports.default = router;
