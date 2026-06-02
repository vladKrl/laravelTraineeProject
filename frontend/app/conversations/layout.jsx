'use client'

import Sidebar from "../components/chat/Sidebar";
import "../styles/global.css";
import {useAuth} from "../hooks/auth";

export default function ConversationsLayout({ children }) {
    const { user } = useAuth();

    return (
        <div className={"flex h-[calc(100vh-120px)] bg-white"}>
            <aside className={"w-[25%] border-r overflow-y-auto"}>
                <Sidebar
                    currentUser={user}
                />
            </aside>

            <main className={"flex flex-1 flex-col h-full min-h-0 overflow-hidden"}>
                {children}
            </main>
        </div>
    );
}