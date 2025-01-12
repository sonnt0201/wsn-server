import sqlite3 from "sqlite3";

import path, { dirname, resolve } from "path";

import { fileURLToPath } from 'url';

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Device } from "@/__interface";

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(dirname(__filename));

console.log(ROOT_DIR);

/**
 * Device Queries functions
 * 
 * Used as ORM exposed object's dependencies in `index.ts`
 * 
 */
export class _DeviceORM {
    _db?: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this._db = db;
    }

    /**
     * Insert multiple devices into the database
     * @param values Array of devices to insert
     */
    createDevices(values: Device[]) {
        values.forEach(({ device_id, description }: Device) => {
            const QUERY = `INSERT INTO devices VALUES ('${device_id}', '${description}', NULL, NULL, NULL)`;
            this._db?.run(QUERY, (err) => {
                if (err) {
                    console.error(`Error inserting device: ${device_id}`, err);
                } else {
                    console.log(`Device inserted: ${device_id}`);
                }
            });
        });
    }

    /**
     * Read all devices in the database
     * @returns Array of devices
     */
    async readDevices(): Promise<Device[]> {
        return new Promise((resolve, reject) => {
            this._db?.all('SELECT * FROM devices', (err, rows) => {
                if (err) {
                    reject(err); // Reject the promise in case of error
                } else {
                    resolve(rows as Device[]); // Resolve with the rows array
                }
            });
        });
    }

    /**
     * Update a device in the database
     * @param device_id ID of the device to update
     * @param updates Object containing the fields to update
     */
    async updateDevice(device_id: string, updates: Partial<Omit<Device, 'device_id'>>): Promise<void> {
        const fields = Object.keys(updates)
            .map((key) => `${key} = '${(updates as any)[key]}'`)
            .join(', ');

        const QUERY = `UPDATE devices SET ${fields} WHERE device_id = '${device_id}'`;

        return new Promise((resolve, reject) => {
            this._db?.run(QUERY, function (err) {
                if (err) {
                    console.error(`Error updating device: ${device_id}`, err);
                    reject(err);
                } else {
                    console.log(`Device updated: ${device_id}`);
                    resolve();
                }
            });
        });
    }

    /**
     * Delete a device from the database
     * @param device_id ID of the device to delete
     */
    async deleteDevice(device_id: string): Promise<void> {
        const QUERY = `DELETE FROM devices WHERE device_id = '${device_id}'`;

        return new Promise((resolve, reject) => {
            this._db?.run(QUERY, function (err) {
                if (err) {
                    console.error(`Error deleting device: ${device_id}`, err);
                    reject(err);
                } else {
                    console.log(`Device deleted: ${device_id}`);
                    resolve();
                }
            });
        });
    }
}
