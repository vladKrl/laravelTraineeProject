'use client'

import ProductList from "../components/products/ProductList";
import React, {Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {useSearchParams} from "next/navigation";
import api from "../../utils/api";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);

    const [nextCursor, setNextCursor] = useState(null);
    const observer = useRef(null);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        let mounted = true;

        setLoading(true);

        setProducts([]);

        const params = Object.fromEntries(searchParams.entries());

        api.get('/api/products', {params})
            .then(r => {
                if (!mounted) return;

                setProducts(r.data.data);
                setNextCursor(r.data.meta.next_cursor || null);
            })
            .catch(e => {
                console.error(e);
                if (mounted) setError(e);
            })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [searchParams]);

    const fetchMore = async () => {
        if (loadingMore || !nextCursor) return;

        setLoadingMore(true);

        try {
            const params = Object.fromEntries(searchParams.entries());

            const response = await api.get('/api/products', {
                params: { ...params, cursor: nextCursor}
            });

            setProducts(prev => [...prev, ...response.data.data]);
            setNextCursor(response.data.meta.next_cursor || null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMore(false);
        }
    };

    const lastProductElementRef = useCallback(node => {
        if (loading || loadingMore) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && nextCursor) {
                fetchMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, loadingMore, nextCursor, searchParams]);

    return (
        <main style={{padding: 20}}>
            <h1 className={"font-bold"}>Products</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <ProductList products={products} loading={loading} error={error}/>
            </Suspense>
            <div ref={lastProductElementRef} className={"h-10 pt-10"}>
                {loadingMore && (
                    <div className={"animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"} />
                )}
                {!nextCursor && products.length > 0 && !loadingMore && (
                    <p className={"text-gray-700 text-sm"}>No more products left to show...</p>
                )}
            </div>
        </main>
    );
}