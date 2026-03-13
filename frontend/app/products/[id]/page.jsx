'use client'

import {notFound, useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import api from "../../../utils/api";
import Button from "../../components/Button";
import Link from "next/link";
import {useAuth} from "../../hooks/auth";

export default function ProductShow() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const { user } = useAuth({middleware: 'auth'});

    const handleDelete = async () => {
        const isConfirmed = window.confirm('Please confirm you want to delete your product (cannot be undone)!');

        if (!isConfirmed) {
            return;
        }

        try {
            await api.delete(`api/products/${id}`);

            router.push('/products');
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/api/products/${id}`);

                setProduct(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error(error);

                if (error.response?.status === 404) {
                    setLoading(false);

                    notFound(); //TODO: change with manually created not-found page and redirect with router
                }
            }
        }

        if (id) fetchProduct();
    }, [id, router]);

    if (loading) {
        return <div className={"p-10 text-center"}>Loading...</div>
    }

    if (!product) {
        return <div className={"p-10 text-center"}>Such product is not found...</div>
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold">{product.label}</h1>
            <p className="text-2xl text-600 font-semibold my-4">{product.price} CURRENCY LATER</p>

            <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="font-bold">Description:</h2>
                <p>{product.description}</p>
            </div>

            <div className="mt-6 border-t pt-4">
                <div>
                    <p>Seller: <strong>{product.user?.name}</strong></p>
                    <p>Published: {new Date(product.created_at).toLocaleDateString()}</p>
                </div>
                    {user && Number(user.id) === Number(product.user_id) && (
                        <div className={"flex justify-evenly"}>
                            <div>
                                <Link
                                    href={`/products/${product.id}/edit`}>
                                    <p className={"text-center bg-purple-600 border-3 border-solid border-purple-700 py-3 px-2 font-bold text-gray-900"}>
                                        Edit product
                                    </p>
                                </Link>
                            </div>
                            <div>
                                <Button
                                    onClick={handleDelete}
                                    className={"bg-red-500 border-3 border-red-800 hover:bg-red-600 text-white px-2 py-3"}
                                >
                                    Delete product
                                </Button>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    )
}