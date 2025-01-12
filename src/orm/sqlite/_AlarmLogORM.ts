
import sqlite3 from "sqlite3";

import path, { dirname, resolve } from "path";

import { fileURLToPath } from 'url';

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'
import { AlarmConfig, AlarmLog, Device } from "@/__interface";

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(dirname(__filename));

/**
 * Alarm Log functions
 * 
 * Used as ORM exposed object's dependencies in `index.ts`
 * 
 */
export class _AlarmLogORM {
    _db?: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this._db = db;
    }

    /**
     * Read alarm logs
     * @param recordId Optional filter by record ID
     * @returns Array of AlarmLog
     */
    async readAlarmLogs(recordId?: string): Promise<AlarmLog[]> {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT * FROM alarm_logs
            ${recordId ? `WHERE record_id='${recordId}'` : ''};
            `;
            this._db?.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as AlarmLog[]);
                }
            });
        });
    }

}