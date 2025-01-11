
"use client";

import Link from "next/link";
import { Card, Navbar } from "flowbite-react";
import { CustomColor } from "./constants";

export function CustomNavBar() {
    return (
        <Card className="max-w-full h-16  mb-2 rounded-none">
            <Navbar fluid  >
                <Navbar.Brand as={Link} href="https://flowbite-react.com">
                    <img src="environment-icon.svg" className="mr-2  h-6 sm:h-9" alt="Flowbite React Logo" />
                    <span className="self-center whitespace-nowrap text-xl font-bold text-green-800 dark:text-white">ENVIRONMENT</span>
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Navbar.Link href="#" active>
                        Home
                    </Navbar.Link>
                    <Navbar.Link as={Link} href="#">
                        About
                    </Navbar.Link>
                    <Navbar.Link href="#">Services</Navbar.Link>
                    <Navbar.Link href="#">Pricing</Navbar.Link>
                    <Navbar.Link href="#">Contact</Navbar.Link>
                </Navbar.Collapse>
            </Navbar>
        </Card>

    );
}


