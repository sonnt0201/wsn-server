"use client"

import { Device, Devices, ID } from "@/orm/sqlite"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { Record } from "@/orm/sqlite"
import { Card } from "flowbite-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const DeviceStateCards = ({
    devices
}: {
    devices: Devices
}) => {

    return (
        <div className="flex flex-col border-dashed hover:border-2 border-indigo-400">
            <h1 className="font-extrabold text-center">Lively Data</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {
                    devices.map(device => {
                        return <StateCard device={device} key={device.device_id} />
                    })
                }
            </div>
        </div>
    )
}


const StateCard = ({
    device
}: {
    device: Device
}) => {

    const intervalRef = useRef<any>(null)
    useEffect(() => {



        intervalRef.current = setInterval(() => {
            fetchNewestRecord()
        }, 1000)

        return () => clearInterval(intervalRef.current)
    }, [])

    const [state, setState] = useState<Record>();
    const [now, setNow] = useState<number>(Date.now())

    const fetchNewestRecord = async () => {
        const res = await axios.get(`/api/th?deviceIds=${device.device_id}&limit=1&type=newest`)
        const data = res.data[0] as Record
        console.log(data)
        setState(data)
        setNow(Date.now())
    }



    return (
        <Card className="mx-2">
            <h1 className="font-extrabold">
                {
                    device.description
                }
            </h1>

            <h1 className="font-bold">
                MAC: {device.device_id}
            </h1>

            <div>Temparature: <span className="text-green-600">{state?.temparature}</span> </div>

            <div>Humidity: <span className="text-green-600">{state?.humidity} </span> </div>

            {

                state &&

                <>
                    <div> {dayjs(state?.time).format("DD/MM/YYYY hh:mm:ss A")}</div>
                    <div>Last updated: {dayjs(state?.time).fromNow()}</div>
                    {(now - state?.time <= 25000) && <div className="text-green-600">Online</div>}
                    {(now - state?.time > 25000) && <div className="text-red-600">Offline</div>}

                </>
            }


        </Card>
    )
}