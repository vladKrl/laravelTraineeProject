"use client";

import { useEffect, useState } from "react";
import api from "../../utils/api";

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        api.get("/products")
            .then(r => {
                if (!mounted) return;
                const raw = r.data?.data ?? r.data;
                setProducts(Array.isArray(raw) ? raw : (raw ? [raw] : []));
            })
            .catch(err => {
                console.error(err);
                if (mounted) setError(err);
            })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, []);

    if (loading) return <div>Loading…</div>;
    if (error) return <div>Error: {String(error.message ?? error)}</div>;
    if (!products.length) return <div>No products</div>;

    return (
        <div>
            {products.map((p) => (
                <div key={p.id}>
                    <h3>{p.label}</h3> — {p.price}
                </div>
            ))}
        </div>
    );
}