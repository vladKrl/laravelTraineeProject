'use client'

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {useAuth} from "../../../hooks/auth";
import api from "../../../../utils/api";
import Link from 'next/link';
import Button from "../../../components/Button";
import Errors from "../../../components/Errors";
import Label from "../../../components/Label";
import AvatarUpload from "../../../components/profiles/AvatarUpload";

export default function ProfileEdit() {
    const { id } = useParams();
    const router = useRouter();

    const { user } = useAuth({middleware: 'auth'});

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({})

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/api/profile/${id}`);

                setProfile(response.data.data);

                setLoading(false);
            } catch (error) {
                console.error(error);

                if (error.response?.status === 404) {
                    return router.push('/');
                }

                router.push(`/profile/${id}`);
            }
        }

        if (user) fetchProfile();
    }, [user, id, router])

    useEffect(() => {
        if (user && Number(user.id) !== Number(id)) {
            router.push(`/profile/${id}`);
        }
    }, [user, id, router]);

    const submitForm = async (e) => {
        e.preventDefault();

        setSaving(true);
        setErrors({});

        try {
            await api.put(`/api/profile/${id}`, { bio: profile.bio });

            router.push(`/profile/${id}`);
        } catch (error) {
            console.error(error);

            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setSaving(false);
        }
    }

    const handleAvatarUpdated = (updatedProfile) => {
        setProfile(currentProfile => ({
            ...currentProfile,
            avatar: updatedProfile.avatar
        }));
    }

    if (loading) {
        return <div className={"p-10 text-center"}>Loading...</div>
    }

    return (
        <div className={"max-w-2xl mx-auto px-4 py-12"}>
            <div className={"bg-white rounded-xl shadow-lg p-8"}>
                <div className={"flex justify-between items-center mb-6"}>
                    <h1 className={"text-2xl font-bold text-gray-800"}>Edit profile</h1>
                    <Link href={`/profile/${id}`} className={"text-gray-500 hover:text-gray-700 text-sm"}>
                        Cancel
                    </Link>
                </div>

                <AvatarUpload
                    profile={profile}
                    onAvatarUpdated={handleAvatarUpdated}
                />

                <form onSubmit={submitForm} className={"space-y-6"}>
                    <div>
                        <Label htmlFor="bio" className={"block text-sm font-medium text-gray-700 mb-2"}>
                            About me:
                        </Label>
                        <textarea
                            id="bio"
                            rows="5"
                            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none ${
                                errors.bio ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Tell something about yourself..."
                            value={profile.bio || ''}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            disabled={saving}
                        />
                        {errors.bio && (
                            <Errors errors={[errors.bio[0]]} />
                        )}
                        <p className={"mt-2 text-xs text-gray-400"}>
                            {profile.bio?.length || 0} / 255 characters
                        </p>
                    </div>

                    <div className={"flex gap-4"}>
                        <Button
                            disabled={saving}
                            className={`${
                                saving ? 'opacity-50' : 'hover:bg-indigo-700'
                            }`}
                        >
                            {saving ? 'Saving...' : 'Save changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}