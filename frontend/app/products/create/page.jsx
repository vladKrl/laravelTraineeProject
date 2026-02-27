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

export default function CreateProduct() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState([]);

    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);

    useEffect(() => {
        api.get('/api/categories').then(res => {
            const formattedCategories = res.data.map(category => ({
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

    const submitForm = async e => {
        e.preventDefault();

        setErrors([]);

        try {
            await api.post('/api/products', {
                label,
                description,
                price,
                categories: selectedCategories
            });

            router.push('/products');
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
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
                        required
                        autoComplete={"off"}
                    />
                    <Errors errors={errors} />
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
                    <Errors errors={errors} />
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
                    <Button>Publish your product</Button>
                </div>
            </form>
        </div>
    )
}