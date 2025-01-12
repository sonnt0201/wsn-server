import sqlite3 from "sqlite3";

import path, { dirname, resolve } from "path";

import { fileURLToPath } from 'url';

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'
import { AlarmConfig, Device } from "@/__interface";

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(dirname(__filename));

console.log(ROOT_DIR);

/**
 * Alarm Config Queries functions
 * 
 * Used as ORM exposed object's dependencies in `index.ts`
 * 
 */
export class _AlarmConfigORM {
    _db?: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this._db = db;
    }

    /**
  * Create or update an alarm configuration
  * @param config Alarm configuration details
  */
    createOrUpdateAlarmConfig(config: AlarmConfig) {
        const query = `
        INSERT INTO alarm_configs (device_id, temparature_upper_bound, temparature_lower_bound, 
        humidity_upper_bound, humidity_lower_bound, enable)
        VALUES (
            '${config.device_id}', 
            ${config.temparature_upper_bound ?? 'NULL'}, 
            ${config.temparature_lower_bound ?? 'NULL'}, 
            ${config.humidity_upper_bound ?? 'NULL'}, 
            ${config.humidity_lower_bound ?? 'NULL'}, 
            ${config.enable ? 1 : 0}
        )
        ON CONFLICT(device_id) DO UPDATE SET 
            temparature_upper_bound=excluded.temparature_upper_bound, 
            temparature_lower_bound=excluded.temparature_lower_bound,
            humidity_upper_bound=excluded.humidity_upper_bound,
            humidity_lower_bound=excluded.humidity_lower_bound,
            enable=excluded.enable;
        `;
        this._db?.run(query, (err) => {
            if (err) {
                console.error("Error creating/updating alarm config:", err);
            } else {
                console.log("Alarm config created/updated successfully.");
            }
        });
    }

    /**
     * Read all alarm configurations
     * @returns Array of AlarmConfig
     */
    async readAlarmConfigs(): Promise<AlarmConfig[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM alarm_configs`;
            this._db?.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as AlarmConfig[]);
                }
            });
        });
    }

}