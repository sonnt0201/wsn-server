"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { LogType, useLog } from "./Logger";
import { AlarmConfig, Device, Devices } from "@/__interface";
import axios from "axios";
import { Button, ButtonGroup, Card, Flowbite, Label, Modal, Table, TextInput } from "flowbite-react";
import { CustomColor } from "../constants";

export const DevicesTable = ({
    onDevicesUpdated,
}: {
    onDevicesUpdated?: (value: Devices) => void;
}) => {


    const [_, log] = useLog();

    const [devices, setDevices] = useState<Devices>([]); // List of devices
    const [alarmConfigs, setAlarmConfigs] = useState<Record<string, AlarmConfig>>({}); // Alarm configs mapped by device_id

    // State for adding a new device


    const [isAddingDevice, setIsAddingDevice] = useState<boolean>(false); // Modal visibility state

    // Update parent component with devices when the devices list changes
    useEffect(() => {
        if (onDevicesUpdated) onDevicesUpdated(devices);
    }, [devices]);

    // Fetch devices and alarm configurations on component mount
    useEffect(() => {
        fetchDevices();
        fetchAlarmConfigs();
    }, []);

    // Fetch devices from API
    const fetchDevices = async () => {
        const res = await axios.get("/api/devices");
        const data = res.data as Devices;
        setDevices(data);
    };

    // Fetch alarm configurations from API
    const fetchAlarmConfigs = async () => {
        const res = await axios.get("/api/alarm");
        const data = res.data as AlarmConfig[];
        const alarmConfigMap: Record<string, AlarmConfig> = {};
        data.forEach((config) => {
            alarmConfigMap[config.device_id] = config;
        });
        setAlarmConfigs(alarmConfigMap);
    };

    const deleteDevice = async (deviceId: string) => {

        try {
            await axios.delete("api/devices", {
                data: {
                    device_id: deviceId
                }
            });

            fetchDevices();
        } catch (error) {
            log(LogType.ERROR, "Error deleting device", (error as Error).message, deviceId );
        }
       
    }


    return (

        <Card className="flex flex-col rounded-none border-solid hover:border-2 ">
            <h1 className="text-center font-bold text-xl">DEVICE TABLE</h1>
            <div className="overflow-x-auto">
                <Table>
                    <Table.Head className="font-bold">
                        <Table.HeadCell className="w-1/4" >Device MAC</Table.HeadCell>
                        <Table.HeadCell>Description</Table.HeadCell>
                        {/* <Table.HeadCell>Alarm Config</Table.HeadCell> */}
                        <Table.HeadCell>Actions</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {/* Render devices and their alarm configurations */}
                        {devices.map((device) => (
                            <Table.Row key={device.device_id}>
                                <Table.Cell className="w-1/4">{device.device_id}</Table.Cell>
                                <Table.Cell>{device.description}</Table.Cell>
                                {/* <Table.Cell>
                                    {alarmConfigs[device.device_id]
                                        ? `${alarmConfigs[device.device_id].temparature_upper_bound ?? "N/A"}-${alarmConfigs[device.device_id].temparature_lower_bound ?? "N/A"} ${alarmConfigs[device.device_id].humidity_upper_bound ?? "N/A"}-${alarmConfigs[device.device_id].humidity_lower_bound ?? "N/A"}`
                                        : "No Config"}
                                </Table.Cell> */}
                                <Table.Cell>
                                    {/* Placeholder buttons for Edit and Delete actions */}
                                    {/* <ButtonGroup id="action buttons"> */}

                                        {/* <Button disabled outline size="xs" color="warning" onClick={() => alert("Edit functionality pending")}>Edit</Button> */}

                                        <Button size="xs"  color="gray" className="font-bold text-black hover:text-red-600" onClick={() => deleteDevice(device.device_id)}>Delete</Button>


                                    {/* </ButtonGroup> */}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
            {/* Add Device Button */}
            {!isAddingDevice && (
                <Button className="m-2 font-bold" color={"success"} onClick={() => setIsAddingDevice(true)}>
                    ADD DEVICE
                </Button>
            )}


            {/* Add Device Modal */}
            <CreateDeviceModal setDevices={setDevices} setAlarmConfigs={setAlarmConfigs} isAddingDevice={isAddingDevice} setIsAddingDevice={setIsAddingDevice}


            />
        </Card>
    );
}


/**
 * form to create a device
 * 
 * fully depends on the above parent, cannot be reusable.
 */
const CreateDeviceModal = (
    {

        setDevices,
        setAlarmConfigs,
        isAddingDevice,
        setIsAddingDevice
    }: {

        setDevices: Dispatch<SetStateAction<Devices>>,
        setAlarmConfigs: Dispatch<SetStateAction<Record<string, AlarmConfig>>>,
        isAddingDevice: boolean,
        setIsAddingDevice: Dispatch<SetStateAction<boolean>>

    }

) => {

    const [_, log] = useLog(); // Custom logging hook
    const [addedDevice, setAddedDevice] = useState<Device>({
        device_id: "",
        description: "",
        latest_temparature: undefined,
        latest_humidity: undefined,
        latest_record_time: undefined,
    });

    // State for configuring alarms for the new device
    const [addedAlarmConfig, setAddedAlarmConfig] = useState<AlarmConfig>({
        device_id: "",
        temparature_upper_bound: undefined,
        temparature_lower_bound: undefined,
        humidity_upper_bound: undefined,
        humidity_lower_bound: undefined,
        enable: true,
    });
    // Create a new device and its alarm configuration
    const createNewDevice = async () => {
        try {
            // Create the device
            const res = await axios.post("/api/devices", [addedDevice]);
            if (res.status === 200) {
                log(LogType.SUCCESS, "Device created successfully", addedDevice.description, addedDevice.device_id);
                setDevices((prev) => [...prev, addedDevice]);

                // Create the alarm configuration for the device
                const alarmRes = await axios.post("/api/alarm", addedAlarmConfig);
                if (alarmRes.status === 200) {
                    log(LogType.SUCCESS, "Alarm configuration created successfully", addedAlarmConfig.device_id);
                    setAlarmConfigs((prev) => ({
                        ...prev,
                        [addedAlarmConfig.device_id]: addedAlarmConfig,
                    }));
                }
            }

            // Reset input states
            setAddedDevice({ description: "", device_id: "" });
            setAddedAlarmConfig({
                device_id: "",
                temparature_upper_bound: undefined,
                temparature_lower_bound: undefined,
                humidity_upper_bound: undefined,
                humidity_lower_bound: undefined,
                enable: true,
            });
        } catch (err) {
            const e = err as Error;
            log(LogType.ERROR, "Error when adding new device", e.message);
        }
    };

    return (
        <Modal show={isAddingDevice} size="xl" onClose={() => setIsAddingDevice(false)} popup>
            <Modal.Header >

                <h3 className={`text-xl p-3 w-full font-extrabold text-green-800 dark:text-white `}>Add a new device profile</h3>



            </Modal.Header>

            <hr id="y-divider" className="h-px mb-3 bg-gray-200 border-0 dark:bg-gray-700" />

            <Modal.Body className="space-y-6">



                <div id="first row wrapper" className="flex flex-row space-x-8">

                    <div id="mac input wrapper">
                        <div className="mb-2 block ">
                            <Label className="font-bold" value="MAC Address" />
                        </div>
                        <TextInput
                            id="mac"
                            placeholder="Enter your device's MAC address"
                            value={addedDevice.device_id}
                            onChange={(event) =>
                                setAddedDevice((prev) => ({
                                    ...prev,
                                    device_id: event.target.value,
                                }))
                            }
                            required
                        />
                    </div>

                    <div id="description input wrapper">
                        <div className="mb-2 block">
                            <Label className="font-bold" value="Description" />
                        </div>
                        <TextInput
                            id="description"
                            placeholder="Enter your device's description"
                            value={addedDevice.description}
                            onChange={(event) =>
                                setAddedDevice((prev) => ({
                                    ...prev,
                                    description: event.target.value,
                                }))
                            }
                        />
                    </div>

                </div>


                <div id="second row wrapper" className="flex flex-row space-x-8">

                    {/* Alarm Configuration Fields */}
                    <div id="T upper bound input wrapper">
                        <div className="mb-2 block">
                            <Label className="font-bold" value="Temperature Upper Bound" />
                        </div>
                        <TextInput
                            id="temp-upper"
                            placeholder="Enter temperature upper bound"
                            type="number"
                            value={addedAlarmConfig.temparature_upper_bound || ""}
                            onChange={(event) =>
                                setAddedAlarmConfig((prev) => ({
                                    ...prev,
                                    temparature_upper_bound: parseFloat(event.target.value),
                                    device_id: addedDevice.device_id,
                                }))
                            }
                        />
                    </div>


                    <div id="T lower bound input wrapper">
                        <div className="mb-2 block">
                            <Label className="font-bold" value="Temperature Lower Bound" />
                        </div>
                        <TextInput
                            id="temp-lower"
                            placeholder="Enter temperature lower bound"
                            type="number"
                            value={addedAlarmConfig.temparature_lower_bound || ""}
                            onChange={(event) =>
                                setAddedAlarmConfig((prev) => ({
                                    ...prev,
                                    temparature_lower_bound: parseFloat(event.target.value),
                                    device_id: addedDevice.device_id,
                                }))
                            }
                        />
                    </div>
                </div>


                <div id="third row wrapper" className="flex flex-row space-x-8">
                    <div id="H upper bound input wrapper">
                        <div className="mb-2 block">
                            <Label className="font-bold" value="Humidity Upper Bound" />
                        </div>
                        <TextInput
                            id="humid-upper"
                            placeholder="Enter humidity upper bound"
                            type="number"
                            value={addedAlarmConfig.humidity_upper_bound || ""}
                            onChange={(event) =>
                                setAddedAlarmConfig((prev) => ({
                                    ...prev,
                                    humidity_upper_bound: parseInt(event.target.value, 10),
                                    device_id: addedDevice.device_id,
                                }))
                            }


                        />
                    </div>

                    <div id="H lower bound input wrapper">
                        <div className="mb-2 block">
                            <Label className="font-bold" value="Humidity Lower Bound" />
                        </div>
                        <TextInput
                            id="humid-lower"
                            placeholder="Enter humidity lower bound"
                            type="number"
                            value={addedAlarmConfig.humidity_lower_bound || ""}
                            onChange={(event) =>
                                setAddedAlarmConfig((prev) => ({
                                    ...prev,
                                    humidity_lower_bound: parseInt(event.target.value, 10),
                                    device_id: addedDevice.device_id,
                                }))
                            }
                        />
                    </div>


                </div>


                <div className="w-full">
                    <Button color="success"
                        className="font-bold"
                        onClick={() => {
                            createNewDevice();
                            setIsAddingDevice(false);
                        }}>
                        SUBMIT
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    )

}