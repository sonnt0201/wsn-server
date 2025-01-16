'use client'

import { Footer } from "flowbite-react"

export const CustomFooter = () => {


    return (
        <Footer container className="fixed bottom-0">
             <Footer.Copyright href="https://github.com/sonnt0201" by="Thai-Son Nguyen" year={2022} />

             <Footer.LinkGroup>
             <Footer.Link href="https://husteduvn-my.sharepoint.com/:w:/g/personal/son_nt212951_sis_hust_edu_vn/EdWprvQkKolLq02ZPraBcjQBGViFaCQvroo7t_7NZ3XXKg?e=NWkf3P">About</Footer.Link>
        <Footer.Link href="https://github.com/sonnt0201">Author</Footer.Link>
      
      </Footer.LinkGroup>
      </Footer>
    )
}