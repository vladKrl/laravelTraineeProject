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

export default function UpdateProduct() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
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

                if (user && user.id !== product.user_id) {
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

                if (error.response?.status === 404) router.push('/');
            }
        };

        if (user)
            fetchData();
    }, [id, user, router]);

    const handleCategoryChange = (selectedOptions) => {
        const categoriesIds = selectedOptions ? selectedOptions.map(option => option.value) : [];

        setSelectedCategories(categoriesIds);
    }

    const submitForm = async e => {
        e.preventDefault();

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
        }
    }

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div className={"max-w-2xl mx-auto p-4 bg-rose-100"}>
            <h1 className={"text-2xl font-bold mb-4"}>Create new product</h1>
            <Errors errors={errors} />
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
                        className={"w-full border rounded p-2"}
                        onChange={e => setDescription(e.target.value)}
                        required
                        autoComplete={"off"}
                    >
                    </textarea>
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

                <div className={"bg-blue-600 text-white px-4 py-2 rounded"}>
                    <Button>Publish edited product</Button>
                </div>
            </form>
        </div>
    )
}