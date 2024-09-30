"use client"

import { useEffect, useState } from "react";
import { useLog } from "./Logger"
import { Devices } from "@/orm/database";
import axios from "axios";
import { Table } from "flowbite-react";

export const DevicesTable = ({
    onDevicesUpdated
}: {
    onDevicesUpdated?: (value: Devices) => void
}) => {

    const [_, log] = useLog();
    const [devices, setDevices] = useState<Devices>([]);

    useEffect(() => {
       if (onDevicesUpdated) onDevicesUpdated(devices);
    }, [devices])

    useEffect(() => {
        fetchDevices();
    }, [])

    const fetchDevices = async () => {
        const res = await axios.get("/api/devices")
        const data = res.data as Devices;
        setDevices(data);
        console.log(data);
    }
    return (
        <div className="flex flex-col">
            <h1 className="text-center font-bold">Devices table</h1>
            <div className="overflow-x-auto">
        <Table>
            <Table.Head>
                <Table.HeadCell>Device MAC</Table.HeadCell>
                <Table.HeadCell>Description</Table.HeadCell>
               
            </Table.Head>
            <Table.Body className="divide-y">
              {
                devices.map((device) => (
                    <Table.Row>
                         <Table.Cell>{device.device_id}</Table.Cell>
                         <Table.Cell>{device.description}</Table.Cell>
                    </Table.Row>
                ))
              }
            </Table.Body>
        </Table>
    </div>
        </div>
    
    )
}