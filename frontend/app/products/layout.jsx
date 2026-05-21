"use client"

import "../styles/global.css";

export default function Layout({children}) {
    return (
        <div className="bg-purple-400">
            {children}
        </div>
    );
}
