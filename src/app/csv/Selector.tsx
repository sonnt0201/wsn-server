'use client'


/**
 * Selector component to select which data (device and time range) to export 
 * 
 */

import { Device, Devices, Records , Record} from "@/__interface";
import axios from "axios";
import { Button, Card, Dropdown } from "flowbite-react"
import { useEffect, useState } from "react"
import { Datepicker } from "flowbite-react";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";


export const Selector = () => {


    const [devices, setDevices] = useState<Devices>([]);

    const [selectedDevice, setSelectedDevice] = useState<Device>();


    const [startTime, setStartTime] = useState<number>(); // timestamp in millisec

    const [endTime, setEndTime] = useState<number>(); // timestamp in millisec


    useEffect(() => {
        fetchDevices();
    }, [])


    // Fetch devices from API
    const fetchDevices = async () => {
        const res = await axios.get("/api/devices");
        const data = res.data as Devices;
        setDevices(data);
    };

    const doExportCsv = async () => {
        if (!selectedDevice) {
            alert("Please select a device.");
            return;
        }
        if (!startTime || !endTime || startTime >= endTime) {
            alert("Please select a valid time range.");
            return;
        }
    
        try {
            // Fetch records from the backend
            const res = await axios.get(`/api/th`, {
                params: {
                    deviceIds: selectedDevice.device_id,
                    beginTime: startTime,
                    endTime: endTime,
                    limit: 1000
                },
            });
    
            const data = res.data as Records;
    
            if (!data.length) {
                alert("No data available for the selected criteria.");
                return;
            }
    
            // Convert the data to CSV format
            const csvContent = [
                [ "Device ID", "Temperature", "Humidity", "Timestamp"], // Header row
                ...data.map(record => [
                    
                    record.device_id,
                    record.temparature,
                    record.humidity,
                    record.time, // Format timestamp
                ]),
            ]
                .map(row => row.join(","))
                .join("\n");
    
            // Trigger CSV file download
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `export_${selectedDevice.device_id}_${Date.now()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            alert("CSV export successful!");
        } catch (error) {
            console.error("Error exporting CSV:", error);
            alert("Failed to export data. Please try again.");
        }
    };
    

    return (
        <Card >

            <div className="flex-row flex">


                <div id="dropdown: device select" className=" w-2/12 p-0 m-0" >

                    <Dropdown className="w-full" color="success" label={selectedDevice ? selectedDevice.description : "Choose a device"} dismissOnClick >


                        {
                            devices.map(device => <Dropdown.Item key={device.device_id} onClick={() => {
                                // console.log(e.target)
                                setSelectedDevice(device)
                            }} value={device.device_id}>{device.device_id} - {device.description}</Dropdown.Item>)
                        }

                    </Dropdown>





                </div>


                <div id="label: from" className="flex items-center justify-center mr-2 font-bold">
                    <p className="text-green-700">From</p>
                </div>


                <div className=" w-3/12">


                    <Datetime closeOnSelect closeOnClickOutside onChange={(val) => setStartTime(_ => {

                        console.log(Number(val.valueOf()))

                        return val ? Number(val.valueOf()) : Date.now()


                    })} />

                </div>


                <div id="label: to" className="flex items-center justify-center mr-2 font-bold">
                    <p className="text-green-700">To</p>
                </div>


                <div className=" w-3/12">



                    <Datetime closeOnSelect closeOnClickOutside onChange={(val) => setEndTime(_ => {

                        console.log(Number(val.valueOf()))

                        return val ? Number(val.valueOf()) : Date.now()


                    })} />

                </div>


                    <Button color={"success"} className="font-bold" onClick={() => doExportCsv()}>Export </Button>
 
            </div>
        </Card>
    )
}