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
exports.pool = void 0;
exports.runStoredProcedure = runStoredProcedure;
exports.runTransaction = runTransaction;
exports.testConnection = testConnection;
const mssql_1 = require("mssql");
const env_1 = __importDefault(require("../config/env"));
const ValidationError_1 = require("../errors/ValidationError");
const InternalError_1 = require("../errors/InternalError");
const databaseService = {
    user: env_1.default.databaseUser,
    password: env_1.default.databasePassword,
    server: env_1.default.databaseServer,
    database: env_1.default.databaseName,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    },
};
// Create a connection pool
const pool = new mssql_1.ConnectionPool(databaseService);
exports.pool = pool;
/**
 * Function to run a stored procedure
 * @param {string} procedureName The name of the stored procedure
 * @param {Record<string, any>} params The parameters for the stored procedure
 * @param {Transaction} [transaction] Optional transaction object
 * @returns The result of the stored procedure
 */
function runStoredProcedure(procedureName_1) {
    return __awaiter(this, arguments, void 0, function* (procedureName, params = {}, transaction) {
        var _a;
        try {
            // Get a connection from the pool
            const connection = yield pool.connect();
            // If transaction is provided, use it; otherwise create a new request
            const request = transaction ? transaction.request() : connection.request();
            // Set the multiple flag
            request.multiple = true;
            // Set the input parameters for the stored procedure
            if (params) {
                Object.keys(params).forEach((key) => {
                    request.input(key, params[key]);
                });
            }
            // Execute the stored procedure
            const result = yield request.execute(procedureName);
            return result.recordsets;
        }
        catch (error) {
            // Check if the error was raised manually
            // Most errors will be caught by the CATCH block in the stored procedure
            // and then rethrown manually. These errors will have errorNumber = 50000
            const errorNumber = error.number;
            // The original error message and number can be extracted from the message
            // If such error was raised, then it is a validation error that can be shown to the user
            const errorMessage = (_a = error.message) === null || _a === void 0 ? void 0 : _a.split(" - Error Number: ");
            const originalErrorNumber = errorMessage === null || errorMessage === void 0 ? void 0 : errorMessage.at(-1);
            if (errorNumber === 50000 && originalErrorNumber === "50000") {
                // The error message will be the original error message
                throw new ValidationError_1.ValidationError("SQL validation error", errorMessage === null || errorMessage === void 0 ? void 0 : errorMessage.at(0));
            }
            else {
                // If the error was not raised manually, then it is an internal error
                console.error(error);
                throw new InternalError_1.InternalServerError("SQL internal error");
            }
        }
    });
}
/**
 * Function to run two stored procedures in a transaction
 * @param {Array<{ name: string, params: Record<string, any> }>} procedures An array of objects with the name and parameters of the stored procedures
 * @param chainIds Whether to pass the ID from the first procedure to the second
 * @returns The result of the first procedure (if needed)
 */
function runTransaction(procedures_1) {
    return __awaiter(this, arguments, void 0, function* (procedures, chainIds = true) {
        const connection = yield pool.connect();
        const transaction = new mssql_1.Transaction(connection);
        const results = [];
        let rowCount = 0;
        try {
            // Begin transaction
            yield transaction.begin();
            // Create TVP
            const affectedEntityIdsTvp = new mssql_1.Table("LogEntryType");
            affectedEntityIdsTvp.columns.add("affectedEntityId", mssql_1.Int);
            // Run stored procedures in sequence
            for (const procedure of procedures) {
                if (chainIds &&
                    rowCount > 0 &&
                    procedure.name == "SP_SystemLog_CreateLog") {
                    procedure.params.IN_affectedEntityIds = affectedEntityIdsTvp;
                }
                const result = (yield runStoredProcedure(procedure.name, procedure.params, transaction))[0];
                if (result) {
                    for (const row of result) {
                        if (row.affectedEntityId) {
                            affectedEntityIdsTvp.rows.add(row.affectedEntityId);
                            rowCount++;
                        }
                    }
                }
                if (procedure.name === "SP_SystemLog_CreateLog") {
                    affectedEntityIdsTvp.rows.splice(0, affectedEntityIdsTvp.rows.length);
                }
                results.push(result);
            }
            // Commit the transaction if both succeed
            yield transaction.commit();
            // Return the result from the first procedure
            return results;
        }
        catch (error) {
            // Rollback the transaction if anything goes wrong
            yield transaction.rollback();
            if (error.cause === undefined) {
                console.error("Transaction failed, rolled back", error);
            }
            throw error;
        }
    });
}
/**
 * Test connection to the database
 * @param {number} [timeout=5000] - Optional timeout in milliseconds
 */
function testConnection() {
    return __awaiter(this, arguments, void 0, function* (timeout = 5000) {
        try {
            const connection = yield pool.connect();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), timeout));
            yield Promise.race([connection, timeoutPromise]);
        }
        catch (error) {
            console.error("Error connecting to the database:", error);
        }
    });
}
// Test connection
pool.connect().then(() => {
    console.log("Connected to the database");
});
