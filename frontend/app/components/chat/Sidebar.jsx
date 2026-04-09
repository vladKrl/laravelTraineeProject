'use client'

import {useEffect, useMemo, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import api from "../../../utils/api";
import Link from "next/link";
import echo from "../../../utils/echo";

export default function Sidebar({ currentUser }) {
    const router = useRouter();

    const { id } = useParams();

    const [conversations, setConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [expandedUserId, setExpandedUserId] = useState(null);

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

    const groupedConversations = useMemo(() => {
        return conversations.reduce((acc, conv) => {
            const userId = conv.interlocutor.id;

            if (!acc[userId]) {
                acc[userId] = {
                    interlocutor: conv.interlocutor,
                    chats: []
                };
            }

            acc[userId].chats.push(conv);

            return acc;
        }, {});
    }, [conversations]);

    return (
        <div className="divide-y overflow-hidden">
            <h2 className="p-4 font-bold text-xl border-b">Messages</h2>
            <div className="overflow-y-auto h-full">
                {Object.values(groupedConversations).map(group => {
                    const userId = group.interlocutor.id;

                    const isExpanded = expandedUserId === userId;

                    return (
                        <div key={userId} className={"border-b border-gray-300"}>
                            <button
                                className={"w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition"}
                                onClick={() => setExpandedUserId(isExpanded ? null : userId)}
                            >
                                <div className="relative">
                                    {group.interlocutor.profile.avatar ? (
                                        <img alt="" src={group.interlocutor.profile.avatar} className="max-w-12 min-w-12 min-h-12 rounded-full object-cover"/>
                                    ) : (
                                        <div className={"w-12 h-12 bg-gray-200 text-blue-500 flex items-center justify-center rounded-full font-bold"}>
                                            {group.interlocutor.name[0]}
                                        </div>
                                    )}
                                    {onlineUsers.some(u => u.id === group.interlocutor.id) &&
                                        <span className={"absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"}></span>}
                                </div>
                                <div className={"flex-grow text-left"}>
                                    <h4 className={"font-bold text-sm"}>{group.interlocutor.name}</h4>
                                    <p className={"text-xs text-gray-500"}>{group.chats.length} {group.chats.length === 1 ? 'conversation' : 'conversations'}</p>
                                </div>
                                <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                    ↓
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="bg-white">
                                    {group.chats.map(conv => (
                                        <Link
                                            key={conv.id}
                                            href={`/conversations/${conv.id}`}
                                            className={`pl-12 pr-4 py-3 block border-t border-gray-100 ${(id && Number(id) === Number(conv.id)) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    alt=""
                                                    src={conv.product.main_image?.path || 'https://placehold.co/50'}
                                                    className={"w-12 h-12 rounded object-cover"}
                                                />
                                                <div className={"flex-grow min-w-0"}>
                                                    <h5 className={"text-xs font-semibold truncate"}>{conv.product.label}</h5>
                                                    <p className="text-xs text-gray-500 truncate mt-1">
                                                        <span className={"text-gray-800"}>{conv.last_message?.user_id === currentUser?.id ? 'You: ' : ''}</span>
                                                        {conv.last_message?.body || 'No messages'}
                                                    </p>
                                                    <span className={"text-[10px] text-gray-600"}>
                                                        {new Date(conv.last_message?.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
