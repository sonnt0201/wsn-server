import { NextRequest, NextResponse } from "next/server"


export function POST(request: NextRequest) {
    
    const searchParams = request.nextUrl.searchParams
    // const name = searchParams.get('name');

    const response = NextResponse.json({
        name: searchParams.get('name'),
        message: "hello world!"
    })

    return response
    // query is "hello" for /api/hello?query=hello
    // query is "hello" for /api/hello?query=hello
  }