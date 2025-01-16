
"use client";

import Link from "next/link";
import { Card, Navbar } from "flowbite-react";
import { CustomColor } from "./constants";

export function CustomNavBar() {
    return (
        <Card className="w-screen h-16  mb-2 rounded-none shadow-none fixed">
            <Navbar fluid  >
                <Navbar.Brand as={Link} href="https://flowbite-react.com">
                    <img src="environment-icon.svg" className="mr-2  h-6 sm:h-9" alt="Flowbite React Logo" />
                    <span className="self-center whitespace-nowrap text-xl font-bold text-green-800 dark:text-white">ENVIRONMENT</span>
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Navbar.Link href="/dev" active>
                        Realtime
                    </Navbar.Link>
                    <Navbar.Link as={Link} href="/csv">
                        Export
                    </Navbar.Link>
                    <Navbar.Link href="/alarms">Alarms</Navbar.Link>
                    <Navbar.Link href="/about">About</Navbar.Link>
                   
                </Navbar.Collapse>
            </Navbar>
        </Card>

    );
}


