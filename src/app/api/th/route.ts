import { ORM } from "@/orm/database"
import { NextRequest, NextResponse } from "next/server"
import { isStringObject } from "util/types"


export async function POST(request: NextRequest) {

    try {
        const value = await request.json()
        console.log(value)

        // const db = sqlite3.Database;
        ORM.createRecords(value)
        const response = NextResponse.json({ message: "oke" })

        return response
    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: "Wrong parameters or values" }, { status: 400 })
    }

    // query is "hello" for /api/hello?query=hello
    // query is "hello" for /api/hello?query=hello
}

export async function GET(req: NextRequest) {

    try {
        const optionKeys = req.nextUrl.searchParams;
        const queryParams:{ [index: string]: string | string[]} = {};

        // Loop through all search parameters and store them in an object
        optionKeys.forEach((value, key) => {
            queryParams[key] = value;
        });


        // console.log((typeof queryParams['deviceIds']) === 'string')

        if ((typeof queryParams['deviceIds']) === 'string') {

            queryParams['deviceIds'] = queryParams['deviceIds'] as string;
            const idArr = queryParams['deviceIds'].split(' ');
            queryParams.deviceIds = idArr;

            
        }
        console.log("options: ", queryParams);

        // const out = ORM.readRecords(queryParams)
        const res = NextResponse.json( (await ORM.readRecords(queryParams)));
       
        return   res
    } catch (err) {
        console.error(err)
        return NextResponse.json({ message: "Wrong parameters or values" }, { status: 400 })
    }
}