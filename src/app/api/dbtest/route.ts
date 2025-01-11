import { ORM } from "@/orm/sqlite";
import {  NextResponse } from "next/server";


export const POST = () => {
    ORM.createTestTable();
    return NextResponse.json({
        oke: "oke"
    })
}