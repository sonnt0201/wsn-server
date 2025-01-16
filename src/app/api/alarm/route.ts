import { AlarmConfig } from "@/__interface";
import { ORM } from "@/orm/sqlite";
import { NextRequest, NextResponse } from "next/server";

import net from "net";

/**
 * Create or update alarm configurations
 * 
 * API: POST /api/alarm-config
 * 
 * Description:
 * - Creates a new alarm configuration or updates an existing one.
 * - If a configuration with the same `device_id` exists, it updates the record.
 * 
 * Request Body Format:
 * ```json
 * {
 *   "device_id": "string",
 *   "temparature_upper_bound": "optional number",
 *   "temparature_lower_bound": "optional number",
 *   "humidity_upper_bound": "optional number",
 *   "humidity_lower_bound": "optional number",
 *   "enable": "boolean"
 * }
 * ```
 * Response:
 * ```http
 * - 200: { message: "Alarm config created/updated successfully" }
 * - 400: { message: "Invalid request or error" }
 * ```
 */
export const POST = async (req: NextRequest) => {
    try {
        const config = (await req.json()) as AlarmConfig;

        if (!config.device_id) {
            return NextResponse.json(
                { message: "device_id is required" },
                { status: 400 }
            );
        }

        ORM.alarmConfig.createOrUpdateAlarmConfig(config);


          // send to tcp server -> esp32 gateway
          const client = new net.Socket();
          client.connect(5000, 'localhost', function () {
              console.log('Connected');
  
              client.write(JSON.stringify(config), () => {
                  // close client
                  client.end(); // Close the connection after writing the data
  
              });
  
  
          });
  
  
          client.on('close', () => {
              console.log('Connection to TCP gateway closed');
          });
  
          client.on('error', (err) => {
              console.error('Error with TCP connection:', err);
          });

        return NextResponse.json({
            message: "Alarm config created/updated successfully",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Invalid request or error" },
            { status: 400 }
        );
    }
};

/**
 * Read all alarm configurations
 * 
 * API: GET /api/alarm-config
 * 
 * Description:
 * - Fetches all alarm configurations from the database.
 * 
 * Request:
 * - No request body required.
 * 
 * Response:
 * - 200: Array of AlarmConfig objects
 * - 400: { message: "Failed to fetch alarm configurations" }
 */
export const GET = async (req: NextRequest) => {
    try {
        const alarmConfigs = await ORM.alarmConfig.readAlarmConfigs();
        return NextResponse.json(alarmConfigs);
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Failed to fetch alarm configurations" },
            { status: 400 }
        );
    }
};

/**
 * Update an existing alarm configuration
 * 
 * API: PUT /api/alarm-config
 * 
 * Description:
 * - Updates an existing alarm configuration based on `device_id`.
 * - Partial updates are supported; only the provided fields will be updated.
 * 
 * Request Body Format:
 * ```json
 * {
 *   "device_id": "string", // required
 *   "temparature_upper_bound": "optional number",
 *   "temparature_lower_bound": "optional number",
 *   "humidity_upper_bound": "optional number",
 *   "humidity_lower_bound": "optional number",
 *   "enable": "optional boolean"
 * }
 * ```
 * Response:
 * ```http
 * - 200: { message: "Alarm config updated successfully" }
 * - 400: { message: "Invalid request or error" }
 * ```
 */
export const PUT = async (req: NextRequest) => {
    try {
        const config = (await req.json()) as Partial<AlarmConfig>;

        // Validate that `device_id` is provided
        if (!config.device_id) {
            return NextResponse.json(
                { message: "device_id is required" },
                { status: 400 }
            );
        }

        // Use the ORM method to update the alarm configuration
        ORM.alarmConfig.createOrUpdateAlarmConfig({
            device_id: config.device_id,
            temparature_upper_bound: config.temparature_upper_bound ?? undefined,
            temparature_lower_bound: config.temparature_lower_bound ?? undefined,
            humidity_upper_bound: config.humidity_upper_bound ?? undefined,
            humidity_lower_bound: config.humidity_lower_bound ?? undefined,
            enable: config.enable ?? false, // Default to false if not provided
        });



        // send to tcp server -> esp32 gateway
        const client = new net.Socket();
        client.connect(5000, 'localhost', function () {
            console.log('Connected');

            client.write(JSON.stringify(config), () => {
                // close client
                client.end(); // Close the connection after writing the data

            });


        });


        client.on('close', () => {
            console.log('Connection to TCP gateway closed');
        });

        client.on('error', (err) => {
            console.error('Error with TCP connection:', err);
        });



        return NextResponse.json({
            message: "Alarm config updated successfully",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Invalid request or error" },
            { status: 400 }
        );
    }
};

