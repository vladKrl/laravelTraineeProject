'use client'

import {useAuth} from "../hooks/auth";

export default function ConversationPage() {
    const { user } = useAuth({middleware: 'auth'});

    return (
        <div className={"flex mt-[10%] gap-4 items-center justify-center bg-gray-50 text-gray-800"}>
            <div className={"text-5xl mb-4"}>💬</div>
            <p className="text-2xl font-medium">Choose chat to chat</p>
        </div>
    );
}