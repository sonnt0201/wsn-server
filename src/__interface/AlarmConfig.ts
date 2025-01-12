
export interface AlarmConfig {
    device_id: string;
    temparature_upper_bound?: number;
    temparature_lower_bound?: number;
    humidity_upper_bound?: number;
    humidity_lower_bound?: number;
    enable: boolean;
}