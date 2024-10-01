import { Device, ORM } from "@/orm/database";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const devices = await req.json()  as Device[]

        console.log(devices)

        ORM.createDevices(devices);
        const res = NextResponse.json({message: "OK"});

        return res;
       

    } catch (err){
        console.log(err);
        return NextResponse.json({message: "Wrong params or values"}, {status: 400})
    }
   
}

export const GET = async (req: NextRequest) => {
    try {
        // console.log(ORM.readDevices())
        return NextResponse.json(await ORM.readDevices());
    } catch (err){
        console.log((err as Error).message)
        return NextResponse.json({message: "Wrong params or values"}, {status: 400})
    }
}