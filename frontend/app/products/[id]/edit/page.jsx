'use client'

import {useParams, useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import api from "../../../../utils/api";
import Errors from "../../../components/Errors";
import Label from "../../../components/Label";
import Input from "../../../components/Input";
import Select from "../../../components/SelectDefault";
import Button from "../../../components/Button";
import {useAuth} from "../../../hooks/auth";

export default function ProductEdit() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const { id } = useParams();
    const { user } = useAuth({middleware: 'auth'});
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);

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
                categories: selectedCategories
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

    if (loading) {
        return <div className={"p-10 text-center"}>Loading...</div>
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