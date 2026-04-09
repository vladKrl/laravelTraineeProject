'use client'

import ProductList from "../components/products/ProductList";
import React, {Suspense, useEffect, useState} from 'react';
import {useSearchParams} from "next/navigation";
import api from "../../utils/api";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        let mounted = true;

        setLoading(true);

        const params = Object.fromEntries(searchParams.entries());

        api.get('/api/products', {params})
            .then(r => {
                if (!mounted) return;

                const raw = r.data.data ?? r.data;

                setProducts(Array.isArray(raw) ? raw : (raw ? [raw] : []));
            })
            .catch(e => {
                console.error(e);
                if (mounted) setError(e);
            })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [searchParams]);

    return (
        <main style={{padding: 20}}>
            <h1 className={"font-bold"}>Products</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <ProductList products={products} loading={loading} error={error}/>
            </Suspense>
        </main>
    );
}