'use client'

import {useParams, useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import api from "../../../utils/api";
import Button from "../../components/Button";
import Link from "next/link";
import {useAuth} from "../../hooks/auth";
import ProductImagesShow from "../../components/products/ProductImagesShow";
import ContactWithSeller from "../../components/products/ContactWithSeller";
import ArchiveModal from "../../components/products/ArchiveModal";
import ReviewForm from "../../components/reviews/ReviewForm";
import NotFound from "../../components/NotFound";

export default function ProductShow() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const router = useRouter();

    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

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

    const handlePutFromArchive = async () => {
        try {
            const response = await api.patch(`api/products/${product.id}/restore`);

            setProduct(prev => ({
                ...prev,
                ...response.data.data,
            }));
        } catch (error) {
            if (error.response?.status === 422 ) {
                alert(error.response.data.errors.product[0]);
            }
        }
    };

    const handlePutInArchive = (updatedProduct) => {
        setProduct(prev => ({
            ...prev,
            ...updatedProduct,
        }));
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
                if (error.response?.status === 404) {
                    setNotFound(true);
                }
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchProduct();
    }, [id, router]);

    const isSold = Boolean(product?.buyer || product?.buyer_id);
    const isArchived = product?.status === 'archived';

    if (loading) {
        return <div className={"p-10 text-center"}>Loading...</div>
    }

    if (notFound) {
        return <NotFound title={`Product ${id}`} message={"This product doesn't exist or deleted!"} backLink={"/products"} backText={"Search other products!"}/>;
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
            <div className={"flex mt-3 flex-wrap gap-1"}>
                <p className={"font-bold"}>Categories: </p>
                {product.categories.map((category) => (
                    <span
                        key={category.id}
                        className={"bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm"}
                    >
                            {category.label}
                        </span>
                ))}
            </div>
            <div className="mt-6 border-t pt-4">
                <div>
                    <p>Seller:
                        <Link className={"hover:text-blue-800"} href={`/profile/${product.user?.id}`}>
                            <strong> {product.user?.name}</strong>
                        </Link>
                    </p>
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
                                        onClick={() => {
                                            if (product.status === 'active') {
                                                setIsArchiveModalOpen(true);
                                            } else {
                                                handlePutFromArchive();
                                            }
                                        }}
                                        disabled={(isSold && isArchived)}
                                        className={`${(isSold && isArchived) ? 'bg-gray-500 border-gray-600 hover:bg-gray-600 cursor-not-allowed' : 'bg-orange-500 border-red-800 hover:bg-orange-600'} border-3 text-white px-2 py-3`}
                                    >
                                        {product.status === 'active'
                                            ? 'Archive product'
                                            : (isSold && isArchived)
                                                ? 'Sold (Archived)'
                                                : 'Put from archive'
                                        }
                                    </Button>
                                )}
                            </div>

                            <ArchiveModal
                                isOpen={isArchiveModalOpen}
                                onClose={() => setIsArchiveModalOpen(false)}
                                product={product}
                                onWasArchived={handlePutInArchive}
                            />
                        </div>
                    )}
                <div className={"flex gap-4 w-full md:w-auto"}>
                    {product.status === 'active' && user && Number(user.id) !== Number(product.user_id) && (
                        <ContactWithSeller productId={product.id} />
                    )}
                </div>
            </div>

            {showSuccessMessage && (
                <div className={"col-span-2 p-6 bg-green-50 border border-green-200 rounded-xl text-center"}>
                    <h4 className="text-green-800 font-semibold">Thank for review!</h4>
                    <p className={"text-green-800 text-sm"}>Your review has been published.</p>
                </div>
            )}

            {product.can_review && !showSuccessMessage &&
                <div className={"col-span-2"}>
                    <ReviewForm
                        productId={product.id}
                        onSuccess={() => {
                            setProduct(prev => ({ ...prev, can_review: false }));
                            setShowSuccessMessage(true);
                            setTimeout(() => setShowSuccessMessage(false), 6000)
                        }}
                    />
                </div>
            }

        </div>
    );
}