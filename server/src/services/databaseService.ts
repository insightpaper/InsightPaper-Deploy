import {
  config,
  ConnectionPool,
  IRecordSet,
  Table,
  Transaction,
  Int,
} from "mssql";

import env from "../config/env";
import { ValidationError } from "../errors/ValidationError";
import { InternalServerError } from "../errors/InternalError";
const databaseService: config = {
  user: env.databaseUser,
  password: env.databasePassword,
  server: env.databaseServer,
  database: env.databaseName,
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
const pool = new ConnectionPool(databaseService);

/**
 * Function to run a stored procedure
 * @param {string} procedureName The name of the stored procedure
 * @param {Record<string, any>} params The parameters for the stored procedure
 * @param {Transaction} [transaction] Optional transaction object
 * @returns The result of the stored procedure
 */
async function runStoredProcedure(
  procedureName: string,
  params: Record<string, any> = {},
  transaction?: Transaction
) {
  try {
    // Get a connection from the pool
    const connection = await pool.connect();

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
    const result = await request.execute(procedureName);

    return result.recordsets as IRecordSet<any>[];
  } catch (error: any) {
    // Check if the error was raised manually

    // Most errors will be caught by the CATCH block in the stored procedure
    // and then rethrown manually. These errors will have errorNumber = 50000
    const errorNumber = error.number;

    // The original error message and number can be extracted from the message
    // If such error was raised, then it is a validation error that can be shown to the user
    const errorMessage = error.message?.split(" - Error Number: ");
    const originalErrorNumber = errorMessage?.at(-1);

    if (errorNumber === 50000 && originalErrorNumber === "50000") {
      // The error message will be the original error message
      throw new ValidationError("SQL validation error", errorMessage?.at(0));
    } else {
      // If the error was not raised manually, then it is an internal error
      console.error(error);
      throw new InternalServerError("SQL internal error");
    }
  }
}

/**
 * Function to run two stored procedures in a transaction
 * @param {Array<{ name: string, params: Record<string, any> }>} procedures An array of objects with the name and parameters of the stored procedures
 * @param chainIds Whether to pass the ID from the first procedure to the second
 * @returns The result of the first procedure (if needed)
 */
async function runTransaction(
  procedures: {
    name: string;
    params: Record<string, any>;
  }[],
  chainIds: boolean = true
): Promise<IRecordSet<any>[]> {
  const connection = await pool.connect();
  const transaction = new Transaction(connection);
  const results: IRecordSet<any>[] = [];
  let rowCount = 0;

  try {
    // Begin transaction
    await transaction.begin();

    // Create TVP
    const affectedEntityIdsTvp = new Table("LogEntryType");
    affectedEntityIdsTvp.columns.add("affectedEntityId", Int);
    // Run stored procedures in sequence
    for (const procedure of procedures) {
      if (
        chainIds &&
        rowCount > 0 &&
        procedure.name == "SP_SystemLog_CreateLog"
      ) {
        procedure.params.IN_affectedEntityIds = affectedEntityIdsTvp;
      }

      const result = (
        await runStoredProcedure(procedure.name, procedure.params, transaction)
      )[0];

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
    await transaction.commit();

    // Return the result from the first procedure
    return results;
  } catch (error: any) {
    // Rollback the transaction if anything goes wrong
    await transaction.rollback();
    if (error.cause === undefined) {
      console.error("Transaction failed, rolled back", error);
    }
    throw error;
  }
}

/**
 * Test connection to the database
 * @param {number} [timeout=5000] - Optional timeout in milliseconds
 */
async function testConnection(timeout: number = 5000) {
  try {
    const connection = await pool.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), timeout)
    );
    await Promise.race([connection, timeoutPromise]);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

// Test connection
pool.connect().then(() => {
  console.log("Connected to the database");
});

export { runStoredProcedure, runTransaction, testConnection, pool };
