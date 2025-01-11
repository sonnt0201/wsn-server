
import sqlite3 from "sqlite3";

import path, { dirname, resolve } from "path";

import { fileURLToPath } from 'url';

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(dirname(__filename));

console.log(ROOT_DIR);

export type ID = string;
export type Devices = Device[];
export type Records = Record[];
export interface Device {
    device_id: string,
    description: string,
    latest_temparature?: number,
    latest_humidity?: number,
    latest_record_time?: number

}

export interface Record {
    record_id: string,
    device_id: string,
    temparature: number,
    humidity: number,
    time: number
}

export interface AlarmConfig {
    device_id: string;
    temparature_upper_bound?: number;
    temparature_lower_bound?: number;
    humidity_upper_bound?: number;
    humidity_lower_bound?: number;
    enable: boolean;
}

export interface AlarmLog {
    record_id: string;
    temparature_upper_bound?: number;
    temparature_lower_bound?: number;
    humidity_upper_bound?: number;
    humidity_lower_bound?: number;
}

class ORM_Class {
    _db?: sqlite3.Database;

    constructor(filePath: string) {

        const fullPath = path.join(ROOT_DIR, filePath);

        // Check if the file exists
        if (!fs.existsSync(fullPath)) {
            // If the file does not exist, create it
            console.log(`Database file not found, creating a new one at: ${fullPath}`);
            fs.writeFileSync(fullPath, ''); // Create an empty file
        }

        this._db = new sqlite3.Database(fullPath);
        // check if the file exists, create it

        const createTableQueries = [

            `CREATE TABLE IF NOT EXISTS devices (device_id VARCHAR PRIMARY KEY,
             description VARCHAR,
             latest_temparature REAL, 
             latest_humidity INTEGER, 
             latest_record_time INTEGER)`,

            `CREATE TABLE IF NOT EXISTS records (record_id VARCHAR PRIMARY KEY, 
            device_id VARCHAR NOT NULL, 
            temparature REAL, humidity INTEGER, 
            time INTEGER NOT NULL, 
            FOREIGN KEY (device_id) REFERENCES devices(device_id));`,

            `
            CREATE TABLE IF NOT EXISTS alarm_configs (
            device_id VARCHAR PRIMARY KEY,
            temparature_upper_bound REAL,
            temparature_lower_bound REAL,
            humidity_upper_bound INTEGER,
            humidity_lower_bound INTEGER,
            enable INTEGER,
            FOREIGN KEY (device_id) REFERENCES devices(device_id));
            );
            `,

            `CREATE TABLE IF NOT EXISTS alarm_logs (
            record_id VARCHAR NOT NULL,
            temparature_upper_bound REAL,
            temparature_lower_bound REAL,
            humidity_upper_bound INTEGER,
            humidity_lower_bound INTEGER,
            FOREIGN KEY (record_id) REFERENCES records(record_id)
            );`,


  ]

        createTableQueries.forEach((query: string) => {
            this._db?.run(query)
        })

    }

    createTestTable() {
        this._db?.run("CREATE TABLE lorem (info TEXT)");
    }

    createDevices(values: Device[]) {

        values.forEach(({
            device_id,
            description,
        }: Device) => {
            console.log({ device_id, description })
            const QUERY = `INSERT INTO devices VALUES (\'${device_id}\', \'${description}\', NULL, NULL, NULL)`
            this._db?.run(QUERY);


        }

        )
    }

    /**
     * Read all devices in database
     * 
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

    // async readDevicesID(): Promise<ID> {
    //      this._db?.all('SELECT device_id FROM devices');

       
    // }

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
    async readRecords(options?:
        {
            deviceIds?: string[],
            type?: "newest" | "oldest",
            limit?: number,
            beginTime?: number,
            endTime?: number


        }
    ): Promise<Record[]> {

       if (options?.limit && options.limit > 100) throw new Error("Limit exceeded");

        // let deviceIds = options?.deviceIds
        if (options?.deviceIds && options.deviceIds.length > 0)
            options.deviceIds = options?.deviceIds?.map(val => (`'` + val + `'`));

        const DEVICE_IDS_QUERY_CHUNK = (options?.deviceIds)?
            `device_id IN ( 
                ${options.deviceIds.join(",")}
            )`
            : `1=1`
        console.log("chunk: ",DEVICE_IDS_QUERY_CHUNK)
        // query begin
        const QUERY = `SELECT * FROM records 
        WHERE 
        ${DEVICE_IDS_QUERY_CHUNK}
        ${options?.beginTime? `AND time>=${options?.beginTime}`: ''}
       ${options?.endTime? ` AND  time<=${options?.endTime}`: ''}
       
        ${(options?.type == "newest")? `ORDER BY time DESC ` : ` `}
        ${(options?.type == "oldest")? `ORDER BY time ASC `: ` `}
        ${(options?.limit)? `LIMIT ${options.limit}`: `100`}
        ` ; // end of query

        console.log("query: ", QUERY)

        return new Promise((resolve, reject) => {
            this._db?.all(QUERY, (err, rows) => {
                if (err) {
                    reject(err); // Reject the promise in case of error
                } else {
                    resolve(rows as Record[]); // Resolve with the rows array
                }
            });
        });

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

    /**
     * Insert a new alarm log
     * @param log Alarm log details
     */
    createAlarmLog(log: AlarmLog) {
        const query = `
        INSERT INTO alarm_logs (record_id, temparature_upper_bound, temparature_lower_bound, 
        humidity_upper_bound, humidity_lower_bound)
        VALUES (
            '${log.record_id}', 
            ${log.temparature_upper_bound ?? 'NULL'}, 
            ${log.temparature_lower_bound ?? 'NULL'}, 
            ${log.humidity_upper_bound ?? 'NULL'}, 
            ${log.humidity_lower_bound ?? 'NULL'}
        );
        `;
        this._db?.run(query, (err) => {
            if (err) {
                console.error("Error inserting alarm log:", err);
            } else {
                console.log("Alarm log created successfully.");
            }
        });
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

/**
 * Singleton object
 */
export const ORM = new ORM_Class("th.db");