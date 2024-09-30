"use client"

import { Devices, ID } from "@/orm/database"
import axios from "axios"
import { useEffect, useState } from "react"
import { Record } from "@/orm/database"
export const DeviceStateCards = ({
    devices
}: {
    devices: Devices
}) => {

    return (<div className="flex flex-row">
        {
            devices.map(device => {
                return <StateCard deviceId={device.device_id}/>
            })
        }
    </div>)
}


const StateCard = ({
    deviceId
}: {
    deviceId: ID
}) => {
    useEffect(() => {
        fetchNewestRecord()
    }, [])

    const fetchNewestRecord = async () => {
        const res = await axios.get(`/api/th?deviceId=${deviceId}&limit=1&type=newest`)
        const data = res.data as Record[]
        console.log(data)
    }

    return 
}