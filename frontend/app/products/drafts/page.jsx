'use client'

import {useEffect, useState} from "react";
import api from "../../../utils/api";
import {useAuth} from "../../hooks/auth";
import ProductList from "../../components/products/ProductList";

export default function DraftsPage() {
    const { user } = useAuth({middleware: 'auth'});

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const response = await api.get('api/products/drafts');

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

        fetchDrafts();
    }, []);

    return (
        <div className={"p-6"}>
            <h1 className="text-2xl font-bold mb-4">Your Drafts!</h1>
            <ProductList products={products} loading={loading} error={error}/>
        </div>
    )
}