'use client'

import { useState, useRef } from 'react';
import api from "../../../utils/api";
import Errors from "../Errors";

export default function AvatarUpload({ profile, onAvatarUpdated }) {
    const fileInputLink = useRef(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const currentAvatarUrl = profile.avatar;

    const placeholder = profile.user.name[0];

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setSaving(true);

        setErrors({});

        try {
            const response = await api.post(`/api/profile/${profile.user_id}/avatar`, formData);

            if (onAvatarUpdated) {
                onAvatarUpdated(response.data.data);
            }
        } catch (error) {
            console.error(error);

            if (error.response?.status === 422) {
                const backendErrors = error.response.data.errors;

                setErrors(Object.values(backendErrors).flat());
            } else {
                setErrors(['Error while uploading. Please try later.']);
            }
        } finally {
            setSaving(false);

            if (fileInputLink.current) {
                fileInputLink.current.value = '';
            }
        }
    }

    const triggerFileSelect = () => {
        if (fileInputLink.current) {
            fileInputLink.current.click();
        }
    }

    return (
        <div className={"flex flex-col items-center gap-4 border-b pb-8 mb-8"}>
            <div
                className={
                `relative w-30 h-30 rounded-full border-4 border-gray-100 shadow-inner group overflow-hidden
                ${saving ? 'animate-pulse' : 'cursor-pointer'}`
            }
                onClick={triggerFileSelect}
            >
                {currentAvatarUrl ? (
                    <img
                        src={currentAvatarUrl}
                        alt="Avatar"
                        className={"w-full h-full object-cover"}
                    />
                ) : (
                    <div className={"w-full h-full bg-gray-200 text-gray-500 flex items-center justify-center text-5xl font-bold uppercase"}>
                        {placeholder}
                    </div>
                )}

                {!saving && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                )}

                {saving && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={triggerFileSelect}
                disabled={saving}
                className={"text-sm text-indigo-600 hover:text-indigo-800 font-medium"}
            >
                {saving ? 'Download...' : (currentAvatarUrl ? 'Change avatar' : 'Load avatar')}
            </button>

            <input
                type="file"
                ref={fileInputLink}
                className="hidden"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleFileChange}
            />

            {errors.length > 0 && (
                <Errors errors={errors}/>
            )}
        </div>
    )
}