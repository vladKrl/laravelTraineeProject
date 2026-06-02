"use client"

import React, {useState} from "react";
import "../../styles/global.css";
import { useAuth } from "../../hooks/auth";
import Button from "../../components/Button";

export default function VerifyEmail() {
    const { logout, resendEmailVerification } = useAuth({middleware: 'auth'})

    const [status, setStatus] = useState(null);

    const submit = (e) => {
        e.preventDefault();

        resendEmailVerification({ setStatus });
    };

    return (
        <div className={"p-5 text-center"}>
            <h1>Please confirm your E-mail</h1>
            <p>If you didn't receive confirmation letter, push the button downside.</p>
            {status === 'verification-link-sent' && (
                <div className={"mb-4 font-bold text-sm text-green-700"}>
                    A new verification link has been sent to the email address you provided.
                </div>
            )}
            <form onSubmit={submit} autoComplete={"off"} className={"space-y-5"}>
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
