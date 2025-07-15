"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = getStatus;
const databaseService_1 = require("../services/databaseService");
/**
 * Returns the status of the server
 */
function getStatus(req, res) {
    (0, databaseService_1.testConnection)(5000)
        .then(() => {
        res
            .status(200)
            .json({ server: "ok", database: "ok", timestamp: new Date() });
    })
        .catch((error) => {
        res
            .status(500)
            .json({ server: "ok", database: "error", timestamp: new Date() });
        console.error(error);
    });
}
