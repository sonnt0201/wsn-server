

export type Devices = Device[];
export interface Device {
    device_id: string,
    description: string,
    latest_temparature?: number,
    latest_humidity?: number,
    latest_record_time?: number

}