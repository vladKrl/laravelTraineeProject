'use client'

import {useEffect, useState} from "react";
import api from "../../../utils/api";
import {useAuth} from "../../hooks/auth";
import {useRouter} from "next/navigation";

export default function LikeButton({ productId, initialIsFavorite = false }) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const router = useRouter();

    const toggle = async (e) => {
        e.preventDefault();

        if (!user) {
            router.push('/login');

            return;
        }

        setLoading(true);

        try {
            const response = await api.post(`/api/products/${productId}/favorites`);

            const favoriteStatus = response.data.data.is_favorite;

            setIsFavorite(favoriteStatus);

            if (!favoriteStatus) {
                window.dispatchEvent(new CustomEvent('favorite:removed', {
                    detail: { productId }
                }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={toggle}
            disabled={loading}
            type="button"
            className={"gap-5 w-full bg-blue-300 text-gray-900 transition text-lg flex items-center px-4 py-2 gap-2 rounded-lg w-max border border-blue-900"}
        >
            <span
                className={`text-xl scale-200 ${isFavorite ? "text-red-500" : "text-gray-500"} ${loading && "animate-pulse"}`}
            >
                ❤
            </span>
            <span>
                {isFavorite ? 'Liked' : 'Like'}
            </span>
        </button>
    );
}