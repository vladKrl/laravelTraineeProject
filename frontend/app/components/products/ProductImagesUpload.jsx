'use client'

import {useMemo, useState} from 'react';
import Errors from "../Errors";
import Label from "../Label";

export default function ProductImagesUpload({ existingImages = [], selectedImages = [], onImagesSelected, onDeleteExisting }) {
    const [errors, setErrors] = useState({});


    const serverImages = existingImages.map(image => ({
        id: image.id,
        url: image.path,
        isServer: true
    }))

    const localImages = useMemo(() => {
        return selectedImages.map((image) => ({
            id: `${image.name}-${image.size}`,
            url: URL.createObjectURL(image),
            file: image,
            isServer: false
        }));
    }, [selectedImages]);

    const allImages = [...serverImages, ...localImages];

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        setErrors({});

        if (files.length + allImages.length > 9) {
            setErrors(['The max number of images is 9!']);
            return;
        }

        onImagesSelected([...selectedImages, ...files]);
    }

    const handleDeleteImage = (image) => {
        if (image.isServer) {
            onDeleteExisting(image.id);
        } else {
            onImagesSelected(selectedImages.filter(file => file !== image.file));
        }
    }

    return (
        <div className="space-y-4">
            <h2 className={"text-xl font-semibold mb-4"}>Images {allImages.length || 0}/9</h2>
            <div className={"grid grid-cols-2 md:grid-cols-3 gap-4"}>
                {allImages.map((image) => (
                    <div key={image.id} className={"relative aspect-square rounded-lg overflow-hidden border"}>
                        <img src={image.url} className="w-full h-full object-cover" alt="Preview" />
                        <button
                            type="button"
                            onClick={() => handleDeleteImage(image)}
                            className={"absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {!image.isServer && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center">
                                New
                            </div>
                        )}
                    </div>
                ))}

                {allImages.length < 9 && (
                    <div>
                        <Label htmlFor="product_images" className={"aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"}>
                            <svg className={"w-8 h-8 text-gray-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span className={"mt-2 text-sm text-gray-500"}>Add image</span>
                        </Label>
                        <input
                            id="product_images"
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                )}
            </div>

            <Errors errors={errors} />
        </div>
    );
}