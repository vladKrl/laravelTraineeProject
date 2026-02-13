"use client";

import { useEffect, useState } from "react";
import api from "../../../utils/api";

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        api.get("/api/products")
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
    }, []);

    if (isLoading) return <div>Is Loading...</div>;

    if (error) return <div>Error: {String(error.message ?? error)}</div>;

    if (!products.length) return <div>No products found</div>;

    return (
        <div>
            {products.map((product) => (
                <div key={product.id}>
                    <h3>{product.label}</h3>  {product.price}
                </div>
            ))}
        </div>
    );
}