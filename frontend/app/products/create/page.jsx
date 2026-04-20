'use client'

import React, { useState, useEffect } from 'react';
import "../../styles/global.css";
import api from "../../../utils/api";
import { useRouter } from 'next/navigation';
import Label from "../../components/Label";
import Input from "../../components/Input";
import Errors from "../../components/Errors";
import Button from "../../components/Button";
import Select from "../../components/SelectDefault";
import ProductImagesUpload from "../../components/products/ProductImagesUpload";
import {useAuth} from "../../hooks/auth";
import LocationSelector from "../../components/products/LocationSelector";

export default function ProductCreate() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);

    const { user } = useAuth({middleware: 'auth'});

    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');

    const [selectedCategories, setSelectedCategories] = useState([]);

    const [regionId, setRegionId] = useState(null);
    const [cityId, setCityId] = useState(null);

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        api.get('/api/categories').then(res => {
            const formattedCategories = res.data.data.map(category => ({
                value: category.id,
                label: category.label
            }));
            setCategories(formattedCategories);
        })
    }, []);

    const handleCategoryChange = (selectedOptions) => {
        const categoriesIds = selectedOptions ? selectedOptions.map(option => option.value) : [];

        setSelectedCategories(categoriesIds);
    }

    const submitForm = async (e, status = 'active') => {
        if (e) e.preventDefault();

        if (!label.trim() && status === 'draft') {
            setErrors({ label: ['A name required to save draft'] });
            return;
        }

        setSaving(true);
        setErrors({});

        const formData = new FormData();

        formData.append('label', label.trim());
        formData.append('description', description);
        formData.append('price', price);
        formData.append('status', status);
        formData.append('region_id', String(regionId ?? ''));
        formData.append('city_id', String(cityId ?? ''));

        selectedCategories.forEach(category => {
            formData.append('categories[]', category);
        });

        selectedFiles.forEach(file => {
           formData.append('images[]', file);
        });

        try {
            await api.post('/api/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            router.push(status === 'draft' ? '/products/drafts' : '/products');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={"max-w-2xl mx-auto p-4 bg-rose-100"}>
            <h1 className={"text-2xl font-bold mb-4"}>Create new product</h1>

            <form onSubmit={submitForm} autoComplete={"off"} className={"space-y-5"}>
                <div>
                    <Label htmlFor="label" className={"block text-sm font-medium"}>Name of the product</Label>
                    <Input
                        id={"label"}
                        type={"text"}
                        value={label}
                        className={"w-full border rounded p-2"}
                        onChange={e => setLabel(e.target.value)}
                        autoComplete={"off"}
                    />
                    {errors.label && (
                        <Errors errors={[errors.label[0]]} />
                    )}
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
                        onLocationChange={({region_id, city_id}) => {
                            setRegionId(region_id);
                            setCityId(city_id);
                        }}
                        errors={errors}
                    />
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <ProductImagesUpload
                        existingImages={[]}
                        selectedImages={selectedFiles}
                        onImagesSelected={setSelectedFiles}
                        onDeleteExisting={() => {}}
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
                        autoComplete={"off"}
                    />
                    {errors.price && (
                        <Errors errors={[errors.price[0]]} />
                    )}
                </div>

                <div className={"flex"}>
                    <Button
                        disabled={saving}
                    >
                        {saving ? 'Publishing...' : 'Publish your product'}
                    </Button>

                    <Button
                        type="button"
                        onClick={() => submitForm(null, 'draft')}
                        disabled={saving}
                        className={"ml-5 text-gray-950 bg-gray-500 hover:bg-gray-600"}
                    >
                        {saving ? 'Saving...' : 'Save as a draft'}
                    </Button>
                </div>
            </form>
        </div>
    )
}