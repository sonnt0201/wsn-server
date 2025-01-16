'use client'

import { useEffect } from "react"

export const Redirect = () => {


    useEffect(() => {
        window.location.assign("/dev")
    },[])

    return (<></>)
}