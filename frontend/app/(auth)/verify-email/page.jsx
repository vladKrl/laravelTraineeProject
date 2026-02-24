"use client"

import React, {useState} from "react";
import "../../styles/global.css";
import { useAuth } from "../../hooks/auth";
import Button from "../../components/Button";

const VerifyEmail = () => {
    const { logout, resendEmailVerification } = useAuth({middleware: 'auth'})

    return (
        <div className={"p-5 text-center"}>
            <h1>Please confirm your E-mail</h1>
            <p>If you didn't receive confirmation letter, push the button downside.</p>
            <form onSubmit={resendEmailVerification} autoComplete={"off"} className={"space-y-5"}>
                <Button className="bg-blue-500 text-white p-2 mt-4">
                    Send verification letter again
                </Button>
            </form>
            <Button onClick={logout} className="bg-blue-500 text-white p-2 mt-4">
                Logout
            </Button>
        </div>
    )
}



export default VerifyEmail;
