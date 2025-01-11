"use client"

import { Logger, LogProvider } from "./Logger"
import React from "react"
import { MainContent } from "./MainContent"
import { Flowbite } from "flowbite-react"
import { customTheme } from "../constants"

export default function Page() {
    return (
        <>
            <Flowbite theme={{theme: customTheme}}>

                <LogProvider>
                    <div className="flex flex-row">
                        <div className="w-10/12">

                            <MainContent />


                        </div>
                        <div className='flex w-2/12'>
                            <Logger />
                        </div>
                    </div>
                </LogProvider>

            </Flowbite>

        </>)

}