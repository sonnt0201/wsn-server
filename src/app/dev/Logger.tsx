"use client";

import { Badge, Button, Timeline } from "flowbite-react";

import { GrClearOption } from "react-icons/gr";
import { AiOutlineClose } from "react-icons/ai";
import { ImWarning } from "react-icons/im";
import { FaBell } from "react-icons/fa6";
import { AiOutlineCheck } from "react-icons/ai";
import { useEffect } from "react";






enum LogType {
    NORMAL,
    SUCCESS,
    WARNING,
    ERROR


}

export {LogType}
export interface ILogMessage {
    time: string;
    title: string;
    deviceId?: string;
    description: string;   
    type: LogType 
}


export function Logger() {

  const [logMessages, log, clearLog] = useLog()

  useEffect(() => {


    if (log) log(LogType.NORMAL, 'welcome', 'Temperature-humidity manager initialized!')
  }, [])

  const icon = (type: LogType) => {
    if (type === LogType.SUCCESS) return <AiOutlineCheck  className={`scale-75 fill-${color(type)}`}/>;
    if (type === LogType.ERROR) return <AiOutlineClose  className={`scale-75 fill-${color(type)}`}/>;
    if (type === LogType.WARNING) return <ImWarning  className={`scale-75 fill-${color(type)}`}/>;
    if (type === LogType.NORMAL) return <FaBell className={`scale-75 fill-${color(type)}`} />
  }

  const color = (type: LogType) => {
    if (type === LogType.SUCCESS) return "green-600";
    if (type === LogType.ERROR) return "red-600";
    if (type === LogType.WARNING) return "yellow-600";
    if (type === LogType.NORMAL) return "blue-500"
  }

  return (
    <div className=" overflow-y-auto justify-center items-center w-12/12 p-3  h-[90vh] font-consolas">
      {<div className="flex justify-between items-center my-3">
        <h2 className="font-consolas text-center font-bold my-2 mx-2">
          Notifications
        </h2>
        <Button onClick={clearLog} pill size="md" gradientDuoTone="pinkToOrange"><GrClearOption className="p-0 m-0" /></Button>
      </div>
      }

      <div className="w-12/12">
        <Timeline>

          {
            (logMessages.length > 0) &&
            logMessages.map((message: ILogMessage, index: number) => <>
              <Timeline.Item>

                <Timeline.Point />


                <Timeline.Content >
                  <Timeline.Time><p style={{
                    color: index === 0 ? "green" : "black",
                    fontWeight: "semi-bold",
                    fontSize: "0.8rem",
                    marginBottom: "0.3rem"
                  }}>{message.time + (index === 0 ? "(Newest)" : "")}</p></Timeline.Time>
                  {/* <Timeline.Title > */}
                    <div className="flex">

                      {icon(message.type)}<p className={`text-sm ml-1 text-${color(message.type)} py-0 m-0`}>{message.title} </p>
                    </div>


                  {/* </Timeline.Title> */}

                  <Timeline.Body>
                    <p style={{
                      color: 'black',
                      fontWeight: "semi-bold",
                      fontSize: "0.8rem",
                      marginTop: "0.3rem"
                    }}>
                      {message.deviceId && `Group: ${message.deviceId}\n`}
                      {message.description}
                    </p>

                  </Timeline.Body>

                </Timeline.Content>
              </Timeline.Item>
            </>)
          }



        </Timeline>
      </div>

    </div>

  )
}


import { createContext, useContext } from 'react';

import { useState } from 'react';
import React from "react";

const LogContext = createContext<[ILogMessage[] ,((type: LogType, title: string, description: string, groupID?: string) => void), () => void ]>([[], (type: LogType, title: string, description: string, groupID?: string) => {}, () => {}]);

export const LogProvider = ({ children }: {
    children: JSX.Element
}) => {

    const [logMessages, setLogMessages] = useState<ILogMessage[]>([])

    const log = (type: LogType, title: string, description: string, deviceId?: string) => {
        const initLog: ILogMessage = {
            title: title,
            time: Date().toString().slice(0, -25),
            deviceId: deviceId,
            description: description,
            type: type,
        }
        setLogMessages(prev => [initLog, ...prev])
    }

    const clearLog = () => {
        setLogMessages([])
    }

    return <LogContext.Provider value={[logMessages, log, clearLog] }>
        {children}
    </LogContext.Provider>
}
// export type LogContextTuple = [LogMessage[] ,((type: LogType, title: string, description: string, groupID?: string) => void) ]| null
export const useLog = () => useContext(LogContext)