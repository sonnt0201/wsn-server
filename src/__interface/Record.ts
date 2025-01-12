
export type Records = Record[];


export interface Record {
    record_id: string,
    device_id: string,
    temparature: number,
    humidity: number,
    time: number
}