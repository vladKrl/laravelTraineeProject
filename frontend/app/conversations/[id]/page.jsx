'use client'

import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import api from "../../../utils/api";
import Chat from "../../components/chat/Chat";
import {useAuth} from "../../hooks/auth";

export default function ConversationShow() {
    const { id } = useParams();
    const { user } = useAuth({middleware: 'auth'});

    const [loading, setLoading] = useState(true);
    const [conversation, setConversation] = useState([]);

    const router = useRouter();

    useEffect(() => {
        const fetchConversation = async () =>{
            try {
                const messagesRes = await api.get(`api/conversations/${id}`);

                setConversation(messagesRes.data.data);
            } catch (error) {
                console.error(error);

                if (error.response?.status === 404) {
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchConversation();
    }, [id, router]);


    if (loading) {
        return <div className={"p-10 text-center"}>Loading...</div>
    }

    if (!conversation) {
        return <div className="p-10 text-center">Conversation not found</div>
    }

    return (
        <div className={"flex flex-col h-full"}>
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div>
                    Product: <strong>{conversation.product?.label}</strong>
                </div>
                <div className="text-sm text-gray-500">
                    Seller: {conversation.interlocutor?.name}
                </div>
            </div>

            <Chat
                chatId={id}
                initialMessages={conversation.messages || []}
                currentUser={user}
            />
        </div>
    );
}