"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSetToJsonString = recordSetToJsonString;
function recordSetToJsonString(recordset) {
    const row = recordset[0][0];
    const jsonColumn = Object.keys(row)[0];
    const jsonString = row[jsonColumn];
    return jsonString;
}
