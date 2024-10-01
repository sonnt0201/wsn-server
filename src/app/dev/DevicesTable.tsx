"use client"

import { useEffect, useState } from "react";
import { LogType, useLog } from "./Logger"
import { Device, Devices } from "@/orm/database";
import axios from "axios";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";

export const DevicesTable = ({
    onDevicesUpdated
}: {
    onDevicesUpdated?: (value: Devices) => void
}) => {

    const [_, log] = useLog();
    const [devices, setDevices] = useState<Devices>([]);

    const [addedDevice, setAddedDevice] = useState<Device>({ device_id: "", description: "" });
    const [isAddingDevice, setIsAddingDevice] = useState<boolean>(false);

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

    const createNewDevice = async () => {
        try {
            const res = await axios.post("/api/devices", [addedDevice])
            if (res.status === 200) {
                log(LogType.SUCCESS, "Device created successfully", addedDevice.description, addedDevice.device_id)
                setDevices(prev => [...prev, addedDevice])
           }
            setAddedDevice({ description: "", device_id: "" })
        } catch (err) {

            const e = err as Error
            log(LogType.ERROR, "Error when adding new device", e.message)
            setAddedDevice({ description: "", device_id: "" })
        }
    }

    return (
        <div className="flex flex-col border-dashed hover:border-2 border-indigo-400">
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
                                <Table.Row key={device.device_id}>
                                    <Table.Cell>{device.device_id}</Table.Cell>
                                    <Table.Cell>{device.description}</Table.Cell>
                                </Table.Row>
                            ))
                        }


                    </Table.Body>
                </Table>
            </div>
            {!isAddingDevice && <Button className="m-2" onClick={() => setIsAddingDevice(true)}>Add device</Button>}
            {/* {isAddingDevice && */}
            <Modal show={isAddingDevice} size="md" onClose={() => setIsAddingDevice(false)} popup>
                <Modal.Header />
                <Modal.Body className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Add a new device profile</h3>

                    <div>
                        <div className="mb-2 block">
                            <Label value="MAC Address" />
                        </div>
                        <TextInput
                            id="mac"
                            placeholder="Text your device's MAC address"
                            value={addedDevice?.device_id}
                            onChange={(event) => setAddedDevice(prev => {
                                return {
                                    ...prev,
                                    device_id: event.target.value
                                }
                            })}
                            required
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label value="Description" />
                        </div>
                        <TextInput
                            id="description"
                            placeholder="Text your device's description"
                            value={addedDevice?.description}
                            onChange={(event) => setAddedDevice(prev => {
                                return {
                                    ...prev,
                                    description: event.target.value
                                }
                            })}

                        />
                    </div>

                    <div className="w-full">
                        <Button onClick={() => {
                            createNewDevice()
                            setIsAddingDevice(false)
                            }}>Submit !</Button>
                    </div>
                </Modal.Body>

            </Modal>
            {/* } */}
        </div>

    )
}