'use client'

import {useState} from "react";
import api from "../../../utils/api";

export default function LikeButton({ productId, initialIsFavorite = false}) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);

    const toggle = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const response = await api.post(`/api/products/${productId}/favorites`);

            setIsFavorite(response.data.data.is_favorite);
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
            className={"gap-5 w-full bg-white text-gray-900 transition text-lg flex items-center px-4 py-2 gap-2 rounded w-max border border-gray-500/30"}
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