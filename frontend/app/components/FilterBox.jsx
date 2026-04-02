'use client'

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import api from "../../utils/api";
import Button from "./Button";

export default function FilterBox () {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [categories, setCategories] = useState([]);

    const activeCategoryIds = searchParams.get('category') ? searchParams.get('category').split(',') : [];

    useEffect(() => {
        api.get('/api/categories').then(res => {
            const formattedCategories = res.data.data.map(category => ({
                value: category.id,
                label: category.label,
            }));
            setCategories(formattedCategories);
        })
    }, []);

    const handleCategorySelect = (id) => {
        const params = new URLSearchParams(searchParams.toString());

        const currentCategories = params.get('category') ? params.get('category').split(',') : [];

        let newCategories;

        if (id === null) {
            newCategories = [];
        } else {
            if (currentCategories.includes(id)) {
                newCategories = currentCategories.filter(categoryId => categoryId !== id);
            } else {
                newCategories = [...currentCategories, id];
            }
        }

        if (newCategories.length > 0) {
            params.set('category', newCategories.join(','));
        } else {
            params.delete('category');
        }

        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className={"flex flex-col gap-6 max-h-[300px] mb-6 overflow-x-auto pb-2"}>
            <Button
                onClick={() => handleCategorySelect(null)}
                className={"text-2xl"}
            >
                Reset categories
            </Button>

            {categories.map(cat => (
                <Button
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value.toString())}
                    className={`flex justify-center ${
                        activeCategoryIds.includes(cat.value.toString())
                            ? 'bg-purple-500 hover:bg-purple-800'
                            : ''
                    }`}
                >
                    {cat.label}
                </Button>
            ))}
        </div>
    );
}