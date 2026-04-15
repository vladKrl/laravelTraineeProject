'use client'

import {useEffect, useState} from "react";
import api from "../../../utils/api";
import {useAuth} from "../../hooks/auth";
import ProductList from "../../components/products/ProductList";

export default function ArchivedPage() {
    const { user } = useAuth({middleware: 'auth'});

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArchivedProducts = async () => {
            try {
                const response = await api.get('api/products/archived');

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

        fetchArchivedProducts();

    }, []);

    return (
        <div className={"p-6"}>
            <h1 className="text-2xl font-bold mb-4">You archived these Products!</h1>
            <ProductList products={products} loading={loading} error={error}/>
        </div>
    )
}