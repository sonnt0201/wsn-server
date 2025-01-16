import { AlarmConfig , Record} from "@/__interface";
import sqlite3 from "sqlite3";

import path, { dirname, resolve } from "path";

import { v4 as uuidv4 } from 'uuid'

/**
 * Device Queries functions
 * 
 * Used as ORM exposed object's dependencies in `index.ts`
 * 
 */
export class _RecordOrm {
    _db?: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this._db = db;
    }
    createRecords(value: {
        device_id: string;
        temparature: number;
        humidity: number;
        time: number;
    }) {
        const record_id = uuidv4();
    
        // Query to insert a new record into the `records` table
        const insertQuery = `INSERT INTO records VALUES (
                '${record_id}', 
                '${value.device_id}', 
                ${value.temparature}, 
                ${value.humidity}, 
                ${value.time}
            );`;
    
        // Query to update the latest values in the `devices` table
        const updateQuery = `UPDATE devices 
                SET latest_temparature = ${value.temparature}, 
                    latest_humidity = ${value.humidity}, 
                    latest_record_time = ${value.time}
                WHERE device_id = '${value.device_id}';
            `;
    
        this._db?.run(insertQuery, (err) => {
            if (err) {
                console.error('Error inserting record:', err);
                return;
            }
    
            console.log('Record inserted successfully.');
    
            // Only update after successful insert
            this._db?.run(updateQuery, (err) => {
                if (err) {
                    console.error('Error updating device:', err);
                    return;
                }
    
                console.log('Latest values updated successfully.');
    
                // Fetch the alarm configuration for the device
                const alarmConfigQuery = `SELECT * FROM alarm_configs WHERE device_id = '${value.device_id}';`;
    
                this._db?.get(alarmConfigQuery, (err, config: AlarmConfig) => {
                    if (err) {
                        console.error('Error fetching alarm configuration:', err);
                        return;
                    }
    
                    if (!config) {
                        console.log('No alarm configuration found for this device.');
                        return;
                    }
    
                    // Check if the recorded values are outside the bounds
                    const isTemperatureOutOfBounds =
                        (config.temparature_upper_bound !== undefined && value.temparature > config.temparature_upper_bound) ||
                        (config.temparature_lower_bound !== undefined && value.temparature < config.temparature_lower_bound);
    
                    const isHumidityOutOfBounds =
                        (config.humidity_upper_bound !== undefined && value.humidity > config.humidity_upper_bound) ||
                        (config.humidity_lower_bound !== undefined && value.humidity < config.humidity_lower_bound);
    
                    if (isTemperatureOutOfBounds || isHumidityOutOfBounds) {
                        // Create an alarm log if values are out of bounds
                        const alarmLogQuery = `
                            INSERT INTO alarm_logs (record_id, temparature_upper_bound, temparature_lower_bound, 
                                humidity_upper_bound, humidity_lower_bound)
                            VALUES (
                                '${record_id}', 
                                ${config.temparature_upper_bound ?? 'NULL'}, 
                                ${config.temparature_lower_bound ?? 'NULL'}, 
                                ${config.humidity_upper_bound ?? 'NULL'}, 
                                ${config.humidity_lower_bound ?? 'NULL'}
                            );
                        `;
    
                        this._db?.run(alarmLogQuery, (err) => {
                            if (err) {
                                console.error('Error creating alarm log:', err);
                            } else {
                                console.log('Alarm log created successfully.');
                            }
                        });
                    }
                });
            });
        });
    }
    

    /**
     * Read TH records
     * 
     * Limited 100 as maximun number of records to read.
     * @param options filters for query
     * @returns 
     */
    async readRecords(options?: {
        deviceIds?: string[];
        type?: "newest" | "oldest";
        limit?: number;
        beginTime?: number;
        endTime?: number;
    }): Promise<Record[]> {
        if (options?.limit && options.limit > 1000) throw new Error("Limit exceeded");
    
        // Format deviceIds for SQL
        const deviceIdsChunk = options?.deviceIds && options.deviceIds.length > 0
            ? `device_id IN (${options.deviceIds.map(id => `'${id}'`).join(",")})`
            : `1=1`;
    
        // Construct the query
        const QUERY = `
            SELECT * FROM records 
            WHERE 
                ${deviceIdsChunk}
                ${options?.beginTime ? `AND time >= ${options.beginTime}` : ""}
                ${options?.endTime ? `AND time <= ${options.endTime}` : ""}
            ${options?.type === "newest" ? "ORDER BY time DESC" : ""}
            ${options?.type === "oldest" ? "ORDER BY time ASC" : ""}
            LIMIT ${options?.limit || 1000}
        `;
    
        console.log("Query:", QUERY); // Debug the query if needed
    
        // Execute the query
        return new Promise((resolve, reject) => {
            this._db?.all(QUERY, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as Record[]);
                }
            });
        });
    }
    


}

