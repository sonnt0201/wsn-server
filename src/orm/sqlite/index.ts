



import sqlite3 from "sqlite3";

import path, { dirname } from "path";

import { fileURLToPath } from 'url';

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'
import { AlarmConfig, AlarmLog, Record, Records, Device, Devices } from "@/__interface";
import { _AlarmConfigORM } from "./_AlarmConfigORM";
import { _AlarmLogORM } from "./_AlarmLogORM";
import { _RecordOrm } from "./_RecordOrm";
import { _DeviceORM } from "./_DeviceORM";


const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(dirname(__filename));

console.log(ROOT_DIR);







class ORM_Class {
    _db?: sqlite3.Database;

    alarmConfig: _AlarmConfigORM;

    alarmLog: _AlarmLogORM;

    record: _RecordOrm;

    device: _DeviceORM;

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


        // init all dependencies
        this.device = new _DeviceORM(this._db);
        this.alarmConfig = new _AlarmConfigORM(this._db);
        this.alarmLog = new _AlarmLogORM(this._db);
        this.record = new _RecordOrm(this._db);

    }

    createTestTable() {
        this._db?.run("CREATE TABLE lorem (info TEXT)");
    }

    // async readDevicesID(): Promise<ID> {
    //      this._db?.all('SELECT device_id FROM devices');


    // }



}

/**
 * Singleton object
 */
export const ORM = new ORM_Class("th.db");