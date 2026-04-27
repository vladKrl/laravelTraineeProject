'use client'

import React, {useState} from "react";
import api from "../../../utils/api";
import Button from "../Button";
import Errors from "../Errors";
import Label from "../Label";

export default function ReviewForm ({ userId, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState('');

    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setErrors({});

        try {
            const response = await api.post(`api/users/${userId}/reviews`, {
                rating,
                body
            });

            setRating(0);
            setBody('');

            if (onSuccess) onSuccess(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={"p-6 bg-white border border-gray-200 rounded-xl shadow-sm"}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Create Review</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your rating</label>
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        return (
                            <Button
                                type="button"
                                key={starValue}
                                className={`text-3xl transition-colors ${
                                    starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHover(starValue)}
                                onMouseLeave={() => setHover(0)}
                            >
                                ★
                            </Button>
                        );
                    })}
                </div>
                {errors.rating && (
                    <Errors errors={[errors.rating[0]]} />
                )}
            </div>

            <div className="mb-4">
                <Label htmlFor="body" className={"block text-sm font-medium mb-2"}>
                    Text (optional)
                </Label>
                <textarea
                    id="body"
                    name="body"
                    value={body}
                    rows="4"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        errors.body ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tell about your experience..."
                    onChange={(e) => setBody(e.target.value)}
                />
                {errors.body && (
                    <Errors errors={[errors.body[0]]} />
                )}
            </div>

            <Button
                disabled={loading || rating === 0}
                className={`w-full ${
                    loading || rating === 0
                        ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-500'
                        : ''
                }`}
            >
                {loading ? 'Publishing...' : 'Publish review'}
            </Button>
        </form>
    );
}