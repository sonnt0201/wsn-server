'use client'


import { Card, createTheme, Flowbite } from "flowbite-react"
import { Selector } from "./Selector"
import { customTheme } from "../constants"

export const CSV = () => {


    return (
        <Flowbite theme={{ theme: customTheme }}>

            <Selector />
        </Flowbite>


    )
}