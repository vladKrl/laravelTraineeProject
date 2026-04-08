'use client'

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import api from "../../../utils/api";
import Link from "next/link";
import echo from "../../../utils/echo";

export default function Sidebar({ currentUser }) {
    const router = useRouter();

    const { id } = useParams();

    const [conversations, setConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    let currentUserId;

    useEffect(() => {
        const channel = echo.join('chat.online')
            .here((users) => {
                setOnlineUsers(users);
            })
            .joining((user) => {
                setOnlineUsers((prev) => [...prev, user]);
            })
            .leaving((user) => {
                setOnlineUsers((prev) => prev.filter(u => u.id !== user.id));
            });

        return () => {
            echo.leave('chat.online');
        };
    }, []);

    useEffect(() => {
        if (!currentUser?.id || !echo) return;

        currentUserId = currentUser?.id;

        const fetchConversation = async () => {
            try {
                const conversationsRes = await api.get('api/conversations');

                setConversations(conversationsRes.data.data);

                const channel = echo.private(`App.Models.User.${currentUserId}`)
                    .listen('.MessageSent', (e) => {
                        updateSidebar(e.message);
                    });
                return () => echo.leave(`App.Models.User.${currentUserId}`)
            } catch (error) {
                console.error(error);

                if (error.response?.status === 404) {
                    return router.push('/');
                }
            }
        }

        if (currentUser) fetchConversation();
    }, [currentUser, echo]);

    const updateSidebar = (newMessage) => {
        setConversations((prev) => {
            const nextConversations = [...prev];

            const index = nextConversations.findIndex(conv => conv.id === newMessage.conversation_id);

            if (index !== -1) {
                nextConversations[index] = {
                    ...nextConversations[index],
                    last_message: newMessage,
                };

                const [updatedChat] = nextConversations.splice(index, 1);

                return [updatedChat, ...nextConversations];
            } else {
                api.get('/api/conversations').then(res => setConversations(res.data.data));

                return prev;
            }
        })
    };

    return (
        <div className="divide-y overflow-hidden">
            <h2 className="p-4 font-bold text-xl border-b">Messages</h2>
            <div className="overflow-y-auto h-full">
                {conversations.map(conv => (
                    <Link key={conv.id} href={`/conversations/${conv.id}`} className={`border-b border-gray-400 block p-4 ${(id && Number(id) === Number(conv.id) ) ? 'bg-gray-200 hover:bg-gray-300' : 'hover:bg-gray-200'} transition`}>
                        <div className={"flex justify-center items-center gap-3"}>
                            <div className="relative">
                                {conv.interlocutor.profile.avatar ? (
                                    <img alt="" src={conv.interlocutor?.profile.avatar} className={"max-w-12 min-w-12 min-h-12 rounded-full object-cover"}/>
                                ) : (
                                    <div className={"w-12 h-12 bg-gray-200 text-gray-500 flex items-center justify-center text-3xl font-bold uppercase rounded-full object-cover"}>
                                        {conv.interlocutor?.name[0]}
                                    </div>
                                )}
                                {onlineUsers.some(u => u.id === conv.interlocutor.id) &&
                                    <span className={"absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"}></span>}
                                <span className={"absolute top-0 text-blue-800 left-15 w-3 h-3"}>{conv.interlocutor?.name}</span>
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className={"flex justify-end gap-2 items-baseline"}>
                                    <div className={"flex items-end flex-col"}>
                                        <span>
                                            <h4 className={"font-semibold truncate text-sm"}>Product: {conv.product.label}</h4>
                                        </span>
                                        <img className={"w-3 h-full origin-top-right scale-700 rounded"} src={conv.product.main_image ? conv.product.main_image.path : 'https://placehold.co/400x300'} alt=""/>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                    {conv.last_message?.user_id === currentUser?.id ? 'You: ' : ''}
                                    {conv.last_message?.body || 'No messages'}
                                </p>
                                <span className="text-[10px] text-gray-600">
                                        {new Date(conv.last_message?.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}