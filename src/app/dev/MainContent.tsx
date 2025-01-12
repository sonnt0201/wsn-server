"use client"

import { useEffect, useRef, useState } from "react"
import { DevicesTable } from "./DevicesTable"
import { AlarmConfig, Devices } from "@/__interface"
import { DeviceStateCards } from "./DeviceStateCards"
import axios from "axios"
import { LogType, useLog } from "./Logger"

export const MainContent = () => {

    const [devices, setDevices] = useState<Devices>([]);

   const [alarmConfigs, setAlarmConfigs] = useState<AlarmConfig[]>([]);


   const [_, log] = useLog();

    useEffect(() => {
        updateAlarmConfigs();
    }, [devices])


    const updateAlarmConfigs = async () => {
        try {
            const res = await axios.get('api/alarm');
            setAlarmConfigs(res.data as AlarmConfig[]);
        } catch (e) {
            log(LogType.ERROR, "Error getting alarm config", (e as Error).message)

        }
    }

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex flex-row space-x-2">

                <div className="w-5/12">
                    <DevicesTable  onDevicesUpdated={(val) => setDevices(val)} />

                </div>
                <div className="w-7/12 ">   <DeviceStateCards devices={devices} alarmConfigs={alarmConfigs}  /></div>
            </div>
        </div>

    )
}