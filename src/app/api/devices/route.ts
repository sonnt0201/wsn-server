import { Device } from "@/__interface";
import { ORM } from "@/orm/sqlite";
import { NextRequest, NextResponse } from "next/server";

/**
 * Create devices
 * 
 * API: POST /api/devices
 * 
 * Description:
 * - Adds new devices to the database.
 * - Accepts an array of devices in the request body.
 * 
 * Request Body Format:
 * [
 *   {
 *     "device_id": "string",
 *     "description": "string",
 *     "latest_temparature": "optional number",
 *     "latest_humidity": "optional number",
 *     "latest_record_time": "optional number"
 *   }
 * ]
 * 
 * Response:
 * - 200: { message: "OK" }
 * - 400: { message: "Wrong params or values" }
 */
export const POST = async (req: NextRequest) => {
    try {
        const devices = (await req.json()) as Device[];

        console.log(devices);

        ORM.device.createDevices(devices);
        const res = NextResponse.json({ message: "OK" });

        return res;
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Wrong params or values" },
            { status: 400 }
        );
    }
};

/**
 * Retrieve all devices
 * 
 * API: GET /api/devices
 * 
 * Description:
 * - Fetches all devices from the database.
 * 
 * Request:
 * - No request body required.
 * 
 * Response:
 * - 200: Array of devices
 * - 400: { message: "Wrong params or values" }
 */
export const GET = async (req: NextRequest) => {
    try {
        return NextResponse.json(await ORM.device.readDevices());
    } catch (err) {
        console.error((err as Error).message);
        return NextResponse.json(
            { message: "Wrong params or values" },
            { status: 400 }
        );
    }
};

/**
 * Update a device
 * 
 * API: PUT /api/devices
 * 
 * Description:
 * - Updates a specific device's information.
 * - Requires the `device_id` and an `updates` object with the fields to update.
 * 
 * Request Body Format:
 * {
 *   "device_id": "string",
 *   "updates": {
 *     "description": "optional string",
 *     "latest_temparature": "optional number",
 *     "latest_humidity": "optional number",
 *     "latest_record_time": "optional number"
 *   }
 * }
 * 
 * Response:
 * - 200: { message: "Device updated successfully" }
 * - 400: { message: "Failed to update device" }
 */
export const PUT = async (req: NextRequest) => {
    try {
        const { device_id, updates } = (await req.json()) as {
            device_id: string;
            updates: Partial<Omit<Device, "device_id">>;
        };

        if (!device_id || !updates) {
            return NextResponse.json(
                { message: "Missing device_id or updates" },
                { status: 400 }
            );
        }

        await ORM.device.updateDevice(device_id, updates);
        return NextResponse.json({ message: "Device updated successfully" });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Failed to update device" },
            { status: 400 }
        );
    }
};

/**
 * Delete a device
 * 
 * API: DELETE /api/devices
 * 
 * Description:
 * - Deletes a specific device by its `device_id`.
 * 
 * Request Body Format:
 * {
 *   "device_id": "string"
 * }
 * 
 * Response:
 * - 200: { message: "Device deleted successfully" }
 * - 400: { message: "Failed to delete device" }
 */
export const DELETE = async (req: NextRequest) => {
    try {
        const { device_id } = (await req.json()) as { device_id: string };

        if (!device_id) {
            return NextResponse.json(
                { message: "Missing device_id" },
                { status: 400 }
            );
        }

        await ORM.device.deleteDevice(device_id);
        return NextResponse.json({ message: "Device deleted successfully" });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Failed to delete device" },
            { status: 400 }
        );
    }
};
