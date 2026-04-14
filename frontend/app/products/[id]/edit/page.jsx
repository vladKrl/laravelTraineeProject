'use client'

import {useParams, useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import api from "../../../../utils/api";
import Errors from "../../../components/Errors";
import Label from "../../../components/Label";
import Input from "../../../components/Input";
import Select from "../../../components/SelectDefault";
import Button from "../../../components/Button";
import ProductImagesUpload from "../../../components/products/ProductImagesUpload";
import {useAuth} from "../../../hooks/auth";
import LocationSelector from "../../../components/products/LocationSelector";

export default function ProductEdit() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const { user } = useAuth({middleware: 'auth'});

    const { id } = useParams();
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');

    const [selectedCategories, setSelectedCategories] = useState([]);

    const [regionId, setRegionId] = useState(null);
    const [cityId, setCityId] = useState(null);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [existingImages, setExistingImages] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, categoriesRes] = await Promise.all([
                    api.get(`/api/products/${id}`),
                    api.get('/api/categories')
                ]);

                const product = productRes.data.data;

                if (user && Number(user.id) !== Number(product.user_id)) {
                    router.push(`/products/${id}`);

                    return;
                }

                setLabel(product.label);
                setDescription(product.description);
                setPrice(product.price);
                setExistingImages(product.images || []);
                setRegionId(product.region?.id);
                setCityId(product.city?.id || null);

                const selectedCategoriesIds = product.categories?.map(c => c.id) || [];
                setSelectedCategories(selectedCategoriesIds);

                const formattedCategories = categoriesRes.data.data.map(category => ({
                    value: category.id,
                    label: category.label
                }));

                setCategories(formattedCategories);

                setLoading(false);
            } catch (error) {
                console.error(error);

                if (error.response?.status === 404) {
                    return router.push('/');
                }

                router.push(`/products/${id}`);
            }
        }

        if (user) fetchData();
    }, [id, user, router]);

    const handleCategoryChange = (selectedOptions) => {
        const categoriesIds = selectedOptions ? selectedOptions.map(option => option.value) : [];

        setSelectedCategories(categoriesIds);
    }

    const submitForm = async e => {
        e.preventDefault();

        setSaving(true);
        setErrors({});

        try {
            await api.put(`/api/products/${id}`, {
                label,
                description,
                price,
                categories: selectedCategories,
                region_id: regionId,
                city_id: cityId,
            });

            router.push(`/products/${id}`);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setSaving(false);
        }
    }

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            return;
        }

        const formData = new FormData();

        selectedFiles.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });

        setUploading(true);

        try {
            const response = await api.post(`/api/products/${id}/images`, formData);

            setSelectedFiles([]);

            if (response.data.data) {
                setExistingImages(prev => [...prev, ...response.data.data]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    }

    const handleDeleteExistingImages = async (imageId) => {
        try {
            await api.delete(`/api/products/${id}/images/${imageId}`);

            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) {
        return <div className={"p-10 text-center"}>Loading...</div>
    }

    return (
        <div className={"max-w-2xl mx-auto p-4 bg-rose-100"}>
            <h1 className={"text-2xl font-bold mb-4"}>Edit this product</h1>
            <form onSubmit={submitForm} autoComplete={"off"} className={"space-y-5"}>
                <div>
                    <Label htmlFor="label" className={"block text-sm font-medium"}>Name of the product</Label>
                    <Input
                        id={"label"}
                        type={"text"}
                        value={label}
                        className={"w-full border rounded p-2"}
                        onChange={e => setLabel(e.target.value)}
                        required
                        autoComplete={"off"}
                    />
                </div>

                <div>
                    <Label htmlFor="description" className={"block text-sm font-medium"}>Description of the product</Label>
                    <textarea
                        name="description"
                        id="description"
                        value={description}
                        cols="30"
                        rows="10"
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none ${
                            errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onChange={e => setDescription(e.target.value)}
                        required
                        disabled={saving}
                    />
                    <span className={` ${description.length < 10 ? 'text-red-500' : ''}`}>{description.length}</span><span>/255</span>
                    {errors.description && (
                        <Errors errors={[errors.description[0]]} />
                    )}
                </div>

                <div>
                    <Label htmlFor="categories" className={"block text-sm font-medium"}>Choose categories</Label>
                    <Select
                        id={'categories'}
                        instanceId={'categories'}
                        name={'categories'}
                        options={categories}
                        value={categories.filter(option => selectedCategories.includes(option.value))}
                        onChange={handleCategoryChange}
                        noOptionsMessage={() => 'No categories found'}
                    />
                </div>

                <div>
                    <LocationSelector
                        initialRegionId={regionId}
                        initialCityId={cityId}
                        onLocationChange={({region_id, city_id}) => {
                            setRegionId(region_id);
                            setCityId(city_id);
                        }}
                        errors={errors}
                    />
                </div>

                <div>
                    <Label htmlFor="price" className={"block text-sm font-medium"}>Set price</Label>
                    <Input
                        id={"price"}
                        type={"number"}
                        value={price}
                        className={"w-full border rounded p-2"}
                        onChange={e => setPrice(e.target.value)}
                        required
                        autoComplete={"off"}
                    />
                </div>

                <div className={"bg-white p-6 rounded-xl shadow"}>
                    <ProductImagesUpload
                        existingImages={existingImages}
                        selectedImages={selectedFiles}
                        onImagesSelected={(files) => setSelectedFiles(files)}
                        onDeleteExisting={handleDeleteExistingImages}
                    />

                    <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading || selectedFiles.length === 0}
                        className={"mt-6 w-full"}
                    >
                        {uploading ? 'Uploading...' : 'Save images'}
                    </Button>
                </div>

                <div className={"flex"}>
                    <Button
                        disabled={saving}
                    >
                        {saving ? 'Applying...' : 'Edit'}
                    </Button>
                </div>
            </form>
        </div>
    )
}