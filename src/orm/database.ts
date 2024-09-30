
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
    description: string

}

export interface Record {
    record_id: string,
    device_id: string,
    temparature: number,
    humidity: number,
    time: number
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
            "CREATE TABLE IF NOT EXISTS devices (device_id VARCHAR PRIMARY KEY, description VARCHAR)",
            "CREATE TABLE IF NOT EXISTS records (record_id VARCHAR PRIMARY KEY, device_id VARCHAR NOT NULL, temparature REAL, humidity INTEGER, time INTEGER NOT NULL, FOREIGN KEY (device_id) REFERENCES devices(device_id));",
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
            const QUERY = `INSERT INTO devices VALUES (\'${device_id}\', \'${description}\')`
            this._db?.run(QUERY);


        }

        )
    }

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

    createRecords(value: {
        device_id: string,
        temparature: number,
        humidity: number,
        time: number
    }) {
        
            // console.log({ device_id, description })
            const record_id = uuidv4();
            const QUERY = `INSERT INTO records VALUES (
                \'${record_id}\', 
                \'${value.device_id}\', 
                ${value.temparature}, 
                ${value.humidity}, 
                ${value.time}
                )`
            // console.log("query: ", QUERY)
            this._db?.run(QUERY);


    }

    async readRecords(options?:
        {
            deviceIds?: string[],
            type?: "newest" | "oldest",
            limit?: number,
            beginTime?: number,
            endTime?: number


        }
    ): Promise<Record[]> {
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
        ${(options?.limit)? `LIMIT ${options.limit}`: ``}
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





}


export const ORM = new ORM_Class("th.db");