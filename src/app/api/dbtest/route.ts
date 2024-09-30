import { ORM } from "@/orm/database";
import {  NextResponse } from "next/server";


export const POST = () => {
    ORM.createTestTable();
    return NextResponse.json({
        oke: "oke"
    })
}