'use client'

import {useEffect, useState} from "react";
import api from "../../../utils/api";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useAuth} from "../../hooks/auth";
import Button from "../Button";

export default function ReviewList ({ userId, type = 'received', onReviewDeleted }) {
    const [reviews, setReviews] = useState([]);
    const [meta, setMeta] = useState(null);

    const { user  } = useAuth();

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchReviews = async (page = 1) => {
            try {
                const response = await api.get(`api/users/${userId}/reviews`, {
                    params: {page}
                });

                setReviews(response.data.data);
                setMeta(response.data.meta)
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        if (userId) fetchReviews();
    }, [userId]);


    const handleDelete = async (reviewId) => {
        const isConfirmed = window.confirm('Please confirm you want to delete your review (cannot be undone)!');

        if (!isConfirmed) {
            return;
        }

        try {
            await api.delete(`api/users/${user.id}/reviews/${reviewId}/delete`);

            onReviewDeleted();
        } catch (error) {
            console.error(error);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
                ★
            </span>
        ));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h3 className={"text-xl font-semibold mb-4"}>
                {type === 'received' ? 'User\'s reviews' : 'My reviews'}
            </h3>

            {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Try to sell something!</p>
            ) : (
                <div>
                    {reviews.map((review) => (
                        <div key={review.id} className={"py-4 px-2 border-4 border-gray-400 shadow-lg bg-gray-200 rounded-md"}>
                            <div className={"flex items-center justify-between mb-2"}>
                                <div className={"flex items-center gap-2"}>
                                    <span className={"font-medium text-gray-900"}>
                                        <Link
                                            href={`/profile/${review.author?.id}`}
                                            className={"hover:font-bold"}
                                        >
                                            {review.author?.name || 'User'}
                                        </Link>
                                    </span>
                                    <div className="flex text-lg">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">{review.created_at}</span>
                            </div>

                            {review.body && (
                                <p className={"text-gray-700"}>
                                    {review.body}
                                </p>
                            )}

                            {Number(review.author.id) === Number(user.id) &&
                                <div>
                                    <Button
                                        onClick={() => handleDelete(review.id)}
                                        className={"bg-red-500 border-3 border-red-800 hover:bg-red-600 text-white px-2 py-3"}
                                    >
                                        Delete review
                                    </Button>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}