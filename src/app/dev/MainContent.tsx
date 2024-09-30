"use client"

import { useState } from "react"
import { DevicesTable } from "./DevicesTable"
import { Devices } from "@/orm/database"
import { DeviceStateCards } from "./DeviceStateCards"

export const MainContent = () => {

    const [devices, setDevices] = useState<Devices>([])

    return (
        <div className="flex flex-row m-2">
            
            <div className="w-4/12">
                <DevicesTable onDevicesUpdated={(val) => setDevices(val)}/>
                <DeviceStateCards devices={devices} />
            </div>
        </div>
    )
}