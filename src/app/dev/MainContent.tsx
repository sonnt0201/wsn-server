"use client"

import { useState } from "react"
import { DevicesTable } from "./DevicesTable"
import { Devices } from "@/orm/database"
import { DeviceStateCards } from "./DeviceStateCards"

export const MainContent = () => {

    const [devices, setDevices] = useState<Devices>([])

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex flex-row space-x-2">

                <div className="w-4/12">
                    <DevicesTable onDevicesUpdated={(val) => setDevices(val)} />

                </div>
                <div className="w-8/12 ">   <DeviceStateCards devices={devices} /></div>
            </div>
        </div>

    )
}