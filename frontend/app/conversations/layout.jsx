'use client'

import Sidebar from "../components/chat/Sidebar";
import "../styles/global.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import {useAuth} from "../hooks/auth";

export default function ConversationsLayout({ children }) {
    const { user } = useAuth();

    return (
        <div className="bg-purple-400">
            <div className="bg-purple-300 max-w-full px-8 mx-auto">
                <Nav />
            </div>
            <div className={"flex h-[calc(100vh-64px)] bg-white"}>
                <aside className={"w-[25%] border-r overflow-y-auto"}>
                    <Sidebar
                        currentUser={user}
                    />
                </aside>

                <main className={"flex-grow-1"}>
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
}