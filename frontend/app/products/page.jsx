'use client'

import ProductList from "../components/products/ProductList";
import React, {Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {useSearchParams} from "next/navigation";
import api from "../../utils/api";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);

    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const observer = useRef(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const searchParams = useSearchParams();

    useEffect(() => {
        let mounted = true;

        setLoading(true);

        setProducts([]);

        setPage(1);

        const params = Object.fromEntries(searchParams.entries());

        api.get('/api/products', {params})
            .then(r => {
                if (!mounted) return;

                setProducts(r.data.data);
                setHasMore(!!r.data.links.next);
            })
            .catch(e => {
                console.error(e);
                if (mounted) setError(e);
            })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [searchParams]);

    const fetchMore = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);

        const nextPage = page + 1;

        try {
            const params = Object.fromEntries(searchParams.entries());

            const response = await api.get('/api/products', {
                params: { ...params, page: nextPage}
            });

            setProducts(prev => [...prev, ...response.data.data]);
            setPage(nextPage);
            setHasMore(!!response.data.links.next);
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
            if (entries[0].isIntersecting && hasMore) {
                fetchMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, searchParams, page]);

    return (
        <main style={{padding: 20}} className={"mb-8"}>
            <h1 className={"font-bold"}>Products</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <ProductList products={products} loading={loading} error={error}/>
            </Suspense>
            <div ref={lastProductElementRef} className={"h-10 pt-10"}>
                {loadingMore && (
                    <div className={"animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"} />
                )}
                {!hasMore && products.length > 0 && !loadingMore && (
                    <p className={"text-blue-900 text-3xl text-center"}>No more products left to show...</p>
                )}
            </div>
        </main>
    );
}