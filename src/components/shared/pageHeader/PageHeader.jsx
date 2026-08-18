'use client'
import React, { useState } from 'react'
import { FiAlignRight, FiArrowLeft } from 'react-icons/fi'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const PageHeader = ({ children }) => {
    const [openSidebar, setOpenSidebar] = useState(false)
    const pathName = usePathname()

    const formatName = (text) => {
        if (!text) return ""
        return text
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())
    }

    let folderName = ""
    let fileName = ""

    if (pathName === "/") {
        folderName = "Dashboard"
        fileName = "Dashboard"
    } else {
        folderName = formatName(pathName.split("/")[1])
        fileName = formatName(pathName.split("/")[2])
    }

    return (
        <div className="page-header">
            <div className="page-header-left d-flex align-items-center">
                <div className="page-header-title">
                    <h5 className="m-b-10">{folderName}</h5>
                </div>
                {/* <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link href="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item">{fileName}</li>
                </ul> */}
            </div>
            {children && (
                <div className="page-header-right ms-auto d-flex align-items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    )
}

export default PageHeader