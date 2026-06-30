'use client'

import {useEffect, useState} from "react";
import api from "../../../utils/api";
import {useAuth} from "../../hooks/auth";
import ProductList from "../../components/products/ProductList";
import Link from "next/link";

export default function PurchasesPage() {
    const { user, isLoading } = useAuth({middleware: 'auth'});

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isLoading || !user) return;

        const fetchPurchases = async () => {
            try {
                const response = await api.get('api/products/purchases');

                setProducts(response.data.data);
            } catch (error) {
                console.error(error);

                setError(error);

                if (error.response?.status === 404) {
                    setLoading(false);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchPurchases();
    }, [isLoading, user]);

    return (
        <div className={"p-6"}>
            <h1 className="text-2xl font-bold mb-4">Your Purchases!</h1>
            <ProductList
                products={products}
                loading={loading}
                error={error}
                title={"Your Purchases"}
                message={"You haven't bought any products!"}
                backLink={'/products'}
                backText={"Go to Products"}
                renderActions={(product) => (
                    <div>
                        {product.can_review ? (
                            <Link
                                href={`/products/${product.id}`}
                                className={"block text-white font-semibold w-full text-center bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg"}
                            >
                                Write Review
                            </Link>
                        ) : (
                            <div className={"text-center text-green-600 font-medium bg-green-50 py-2 rounded-lg"}>
                                Review Submitted!
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    )
}