'use client'

import { useState, useEffect, useRef } from 'react';
import echo from "../../../utils/echo";
import api from "../../../utils/api";
import Button from "../Button";

export default function Chat({ chatId, initialMessages, currentUser }) {
    const [messages, setMessages] = useState(initialMessages || []);
    const [newMessage, setNewMessage] = useState('');
    const [isInterlocutorTyping, setIsInterlocutorTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const channel = echo.private(`chat.${chatId}`)
            .listen('.MessageSent', (e) => {
                setMessages((prev) => {
                    const isDouble = prev.some(msg => msg.id === e.message.id);

                    if (isDouble) {
                        return prev;
                    }

                    return [...prev, e.message];
                })
            })
            .listenForWhisper('typing', (e) => {
                setIsInterlocutorTyping(true);

                if (typingTimeoutRef.current)
                    clearTimeout(typingTimeoutRef.current);

                typingTimeoutRef.current = setTimeout(() => {
                    setIsInterlocutorTyping(false);
                }, 3000);

                console.log(`${e.name} typing...`);
            });

        return () => {
            echo.leave(`chat.${chatId}`);

            if (typingTimeoutRef.current)
                clearTimeout(typingTimeoutRef.current);
        };
    }, [chatId, echo]);

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);

        echo.private(`chat.${chatId}`).whisper('typing', {
            name: currentUser.name,
        });
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        try {
            const res = await api.post(`/api/conversations/${chatId}/messages`, {
                body: newMessage
            });

            setMessages((prev) => {
                const isDouble = prev.some(msg => msg.id === res.data.data.id);

                if (isDouble) {
                    return prev;
                }

                return [...prev, res.data.data];
            })

            setNewMessage('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={"flex flex-col h-[80%] border rounded-lg"}>
            <div className={"flex-grow overflow-y-auto p-4 space-y-4"}>
                {messages.map((msg) => {
                    const isMine = Number(msg.user_id) === Number(currentUser.id);

                    return (
                        <div key={msg.id} className={`p-2 rounded-lg max-w-[75%] ${isMine ? 'bg-indigo-200 self-end ml-auto' : 'bg-gray-200 self-start mr-auto'}`}>
                            {msg.body}
                        </div>
                    )
                })}
                <div ref={scrollRef} />
                {isInterlocutorTyping && <div className="text-xs text-gray-500 italic">Typing...</div>}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                <input
                    value={newMessage}
                    onChange={handleInputChange}
                    className="flex-grow border rounded px-3 py-2"
                    placeholder="Write message..."
                />
                <Button type="submit">
                    Send
                </Button>
            </form>
        </div>
    );
}