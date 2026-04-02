"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import api from "../../../utils/api";
import { useSearchParams } from "next/navigation";

export default function ProductList() {
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

    if (loading) {
        return <div className={"p-10 text-center"}>Loading...</div>
    }
    
    if (error) {
        return <div>Error: {String(error.message ?? error)}</div>;
    }

    if (!products.length) {
        return <div>No products found</div>;
    }

    return (
        <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4"}>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}