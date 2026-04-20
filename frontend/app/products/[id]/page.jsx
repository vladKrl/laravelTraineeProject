'use client'

import {notFound, useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import api from "../../../utils/api";
import Button from "../../components/Button";
import Link from "next/link";
import {useAuth} from "../../hooks/auth";
import ProductImagesShow from "../../components/products/ProductImagesShow";
import ContactWithSeller from "../../components/products/ContactWithSeller";

export default function ProductShow() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [images, setImages] = useState([]);

    const router = useRouter();

    const { user } = useAuth();

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
    };

    const handleArchive = async () => {
        try {
            await api.patch(`api/products/${product.id}/toggleArchive`);

            setProduct(prev => ({
                ...prev,
                status: product.status === 'active' ? 'archived' : 'active',
            }));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/api/products/${id}`);
                const productData = response.data.data;

                setProduct(productData);

                if (productData) {
                    setImages(productData.images || []);
                }

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
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-4xl font-bold">{product.label}</h1>
            <div className={"flex items-end gap-10"}>
                <p className="text-2xl text-600 font-semibold mt-6">{product.price} BYN</p>
                <h2 className={"flex font-semibold gap-1"}>
                    Status:<p>{product.status}</p>
                </h2>
            </div>
            <div className={"grid p-10 grid-cols-2 gap-8 bg-gray-100 rounded-lg "}>
                <div className={"flex flex-col"}>
                    <div className={"pb-[90%]"}>
                        <h2 className="font-bold">Description:</h2>
                        <p>{product.description}</p>
                    </div>
                    <div>
                        <h2>
                            Location: {product.region?.name}{product.city ? `, ${product.city?.name}` : ''}
                        </h2>
                    </div>
                </div>
                <div className={"w-full"}>
                    <ProductImagesShow
                        images={images}
                    />
                </div>
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
                                    <p className={"text-center bg-purple-600 border-3 border-solid border-purple-700 hover:bg-purple-700 py-3 px-2 font-bold text-gray-900"}>
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
                            <div>
                                {product.status !== 'draft' && (
                                    <Button
                                        onClick={handleArchive}
                                        className={"bg-orange-500 border-3 border-red-800 hover:bg-orange-600 text-white px-2 py-3"}
                                    >
                                        {product.status === 'active' ? 'Archive product' : 'Put from archive'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                <div className={"flex gap-4 w-full md:w-auto"}>
                    {product.status === 'active' && user && Number(user.id) !== Number(product.user_id) && (
                        <ContactWithSeller productId={product.id} />
                    )}
                </div>
            </div>
        </div>
    )
}