import { ORM } from "@/orm/sqlite"
import { NextRequest, NextResponse } from "next/server"




export async function GET(req: NextRequest) {

    try {
        const optionKeys = req.nextUrl.searchParams;
        const queryParams:{ [index: string]: string | string[]} = {};

        // Loop through all search parameters and store them in an object
        optionKeys.forEach((value, key) => {
            queryParams[key] = value;
        });


        // console.log((typeof queryParams['deviceIds']) === 'string')

        
        const devices = await ORM.readDevices();

      

        // const out = ORM.readRecords(queryParams)
        const res = NextResponse.json( (await ORM.readRecords(queryParams)));
       
        return   res
    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: "Wrong parameters or values" }, { status: 400 })
    }
}