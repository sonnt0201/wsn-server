import { AlarmConfig } from "@/__interface";
import { ORM } from "@/orm/sqlite";
import { NextRequest, NextResponse } from "next/server";

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
