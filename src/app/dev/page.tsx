"use client"

import { Logger, LogProvider } from "./Logger"
import React from "react"
import { MainContent } from "./MainContent"

export default function Page() {
    return (
        <>


            <LogProvider>
                <div className="flex flex-row">
                    <div className="w-10/12">
                        
                        <MainContent/>

                        
                    </div>
                    <div className='flex w-2/12'>
                        <Logger />
                    </div>
                </div>
            </LogProvider>
        </>)

}