'use client'

import {notFound, useParams, useRouter} from "next/navigation";
import {useAuth} from "../../hooks/auth";
import {useEffect, useState} from "react";
import api from "../../../utils/api";
import Link from "next/link";
import ProductCard from "../../components/products/ProductCard";

export default function ProfileShow() {
    const { id } = useParams();
    const router = useRouter();

    const { user  } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/api/profile/${id}`);

                setProfile(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error(error);

                if (error.response?.status === 404) {
                    setLoading(false);

                    notFound(); //TODO: change with manually created not-found page and redirect with router
                }
            }
        }

        if (id) fetchProfile();
    }, [id, router]);

    if (loading) {
        return <div className={"p-10 text-center"}>Loading...</div>
    }

    const isUserOwnProfile = user && Number(user.id) === Number(profile.user_id);

    return (
        <div className={"max-w-6xl mx-auto px-4 py-8"}>
            <section className={"flex flex-col bg-white rounded-lg shadow-sm p-6 mb-8 md:flex-row items-center gap-6"}>
                <div>
                    <div className={"relative w-30 h-30 rounded-full border-4 border-gray-100 shadow-inner group overflow-hidden"}>
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                alt="Avatar"
                                className={"w-full h-full object-cover"}
                            />
                        ) : (
                            <div className={"w-full h-full bg-gray-200 text-gray-500 flex items-center justify-center text-5xl font-bold uppercase"}>
                                {profile.user.name[0]}
                            </div>
                        )}
                    </div>
                </div>

                <div className={"flex-grow text-center md:text-left"}>
                    <h1 className={"text-3xl font-bold text-gray-800"}>{profile.user.name}</h1>
                    <p className={"text-gray-500 mb-4"}>Registered: {new Date(profile.created_at).toLocaleDateString()}</p>
                    <div className={"bg-gray-50 p-4 rounded-md italic text-gray-700"}>
                        {profile.bio || "Nothing to reveal here. Nothing."}
                    </div>
                </div>

                {isUserOwnProfile && (
                    <div className={"flex-shrink-0"}>
                        <Link
                            href={`/profile/${id}/edit`}
                            className={"bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"}
                        >
                            Edit profile
                        </Link>
                    </div>
                )}
            </section>

            <section>
                <h2 className={"text-2xl font-semibold mb-6"}>
                    {isUserOwnProfile ? "My products:" : `${profile.user.name}'s products:`}
                </h2>

                {profile.user.products && profile.user.products.length > 0 ? (
                    <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}>
                        {profile.user.products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className={"bg-gray-50 rounded-lg p-10 text-center text-gray-500"}>
                        Nothing to look at
                    </div>
                )}
            </section>

            {isUserOwnProfile && (
                <section className={"pt-10"}>
                    <div>
                        <Link
                            href={`/products/create`}
                            className={"bg-blue-600 border-4 border-blue-700 hover:bg-blue-700 hover:border-blue-800 text-white px-6 py-2 rounded-md transition"}
                        >
                            Add new product
                        </Link>
                    </div>
                </section>
            )}
        </div>
    )
}