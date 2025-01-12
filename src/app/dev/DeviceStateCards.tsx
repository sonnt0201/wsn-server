"use client"

import { AlarmConfig, Device, Devices } from "@/__interface"
import axios from "axios"
import { useEffect, useMemo, useRef, useState } from "react"
import { Record } from "@/__interface"
import { Card } from "flowbite-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { LogType, useLog } from "./Logger"

dayjs.extend(relativeTime)

export const DeviceStateCards = ({
    devices,
    alarmConfigs
}: {
    devices: Devices,
    alarmConfigs: AlarmConfig[]
}) => {

    return (
        <div className="flex flex-col rounded-none  border-solid px-6">
            {/* <h1 className="font-extrabold text-center">Lively Data</h1> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  gap-y-6">
                {
                    devices.map(device => {
                        return <StateCard device={device} key={device.device_id} alarmConfig={alarmConfigs.find(val => val.device_id === device.device_id)} />
                    })
                }
            </div>
        </div>
    )
}


const StateCard = ({
    device,
    alarmConfig
}: {
    device: Device,
    alarmConfig?: AlarmConfig
}) => {

    const prevStateIDRef = useRef<string>("")

    const intervalRef = useRef<any>(null)
    useEffect(() => {



        intervalRef.current = setInterval(() => {
            fetchNewestRecord(prevStateIDRef.current)
        }, 1000)

        return () => clearInterval(intervalRef.current)
    }, [])

    const [state, setState] = useState<Record>();
    const [now, setNow] = useState<number>(Date.now())

    const [alarms, setAlarms] = useState<("TemperatureLowerBound" | "TemperatureUpperBound" | "HumidityLowerBound" | "HumidityUpperBound")[]>([])

   

    const [, log] = useLog();

    const fetchNewestRecord = async (prevID: string) => {
        const res = await axios.get(`/api/th?deviceIds=${device.device_id}&limit=1&type=newest`)
        const data = res.data[0] as Record

        console.log(prevStateIDRef.current)



        // Compare new data with the previous state
        if ( data.record_id !== prevID) {
           prevStateIDRef.current = data.record_id;
            setState(_ => data)
           
          
        }

      setNow(Date.now())

      
    }




    /**
     *  check outbound value each time state changes
 * This function checks for outbound alarm conditions based on configured bounds
 * and the current state of temperature and humidity. It returns an array of alarm
 * types that are currently triggered.
 * 
 * @returns {("TemperatureLowerBound" | "TemperatureUpperBound" | "HumidityLowerBound" | "HumidityUpperBound")[]}
 *          An array of strings representing the triggered alarm types.
 */
   useMemo(
        () => {


            // check alarm enabled
            if (!alarmConfig?.enable) return []

            const out: ("TemperatureLowerBound"
                | "TemperatureUpperBound"
                | "HumidityLowerBound"
                | "HumidityUpperBound")[] = [];

            if (alarmConfig?.humidity_lower_bound
                && state?.humidity
                && alarmConfig?.humidity_lower_bound > state?.humidity
            ) {
                out.push("HumidityLowerBound")

                log(LogType.ERROR, "TOO DRY", `${device.description}: Humidity is low`, device.device_id)

            }


            if (alarmConfig?.humidity_upper_bound
                && state?.humidity
                && alarmConfig?.humidity_upper_bound < state?.humidity
            ) {
                out.push("HumidityUpperBound")
                log(LogType.ERROR, "TOO WET!", `${device.description}: Humidity is too high`, device.device_id)
            }


            if (alarmConfig?.temparature_lower_bound
                && state?.temparature
                && alarmConfig?.temparature_lower_bound > state?.temparature
            ) {
                out.push("TemperatureLowerBound");
                log(LogType.ERROR, "TOO COLD!", `${device.description}: Temperature is low`, device.device_id)
            }


            if (
                alarmConfig.temparature_upper_bound && state?.temparature
                && alarmConfig.temparature_upper_bound < state.temparature
            ) {
                out.push("TemperatureUpperBound");
                log(LogType.ERROR, "TOO HOT!", `${device.description}: Temperature is high`, device.device_id)
            }

            setAlarms(out)

        }, [state, alarmConfig])


    /**
* Formats a 12-character MAC address by adding "-" as a separator.
* 
* @param {string} mac - A 12-character hexadecimal string representing the MAC address.
* @returns {string} - The formatted MAC address with "-" separators (e.g., "A1-B2-C3-D4-E5-F6").
* @throws {Error} - If the input is not a valid 12-character hexadecimal string.
*/
    function formatMACAddress(mac: string): string {
        // Step 1: Validate input
        // The input must be exactly 12 characters and contain only valid hexadecimal characters (0-9, A-F, a-f).
        if (!/^[0-9A-Fa-f]{12}$/.test(mac)) {
            throw new Error("Invalid MAC address format. Must be a 12-character hexadecimal string.");
        }

        // Step 2: Format the MAC address
        // Use a regular expression to group every two characters, then join them with a "-" separator.
        return mac.match(/.{1,2}/g)!.join(':');
    }


    return (
        <Card className="m-0 lg:max-w-80 lg:min-w-72" key={device.device_id}>
            <h1 className="font-extrabold text-2xl text-green-800">
                {
                    device.description
                }
            </h1>

            <h1 className="font-bold">
                {formatMACAddress(device.device_id)}
            </h1>



            <p id="state-display" className="flex items-center text-2xl">
                <img src="environment-icon.svg" className="mr-2 h-16 sm:h-16" alt="Flowbite React Logo" />

                <span
                    className={`
                       ${(alarms.includes("TemperatureLowerBound") || alarms.includes("TemperatureUpperBound"))
                            ? "text-red-600 font-bold mx-2"
                            : "text-black font-bold mx-2"}
                    `}
                >
                    {state?.temparature} &#8304;C
                </span>

                <span className={
                    (alarms.includes("HumidityLowerBound") || alarms.includes("HumidityUpperBound")) ?
                        `text-red-600 font-bold mx-2` : `text-black font-bold mx-2`}
                >{state?.humidity} %</span>
            </p>



            {

                state &&

                <>
                    <div> {dayjs(state?.time).format("DD/MM/YYYY hh:mm:ss A")}</div>
                    <div>Updated: {dayjs(state?.time).fromNow()}</div>
                    {(now - state?.time <= 25000) && <div className="text-green-600">Online</div>}
                    {(now - state?.time > 25000) && <div className="text-red-600">Offline</div>}

                </>
            }


        </Card>
    )
}