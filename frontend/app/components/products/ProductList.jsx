"use client";

import { useEffect, useState } from "react";
import api from "../../../utils/api";
import Link from "next/link";

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
                <div className={"pt-2 pb-2"} key={product.id}>
                    <div><h4>Categories - {product.categories.map((category) => (<div key={category.id}>{category.label}</div>))}</h4></div>
                        <div className="max-w-sm w-full bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                            <div className="">
                                <img
                                    src="https://placehold.co/400x300"
                                    alt="Product"
                                    className="w-full h-52 object-cover"
                                />
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <Link href={`/products/${product.id}`}><h3 className={"text-xl font-bold text-gray-900 hover:text-[21px] pb-2"}>{product.label}</h3></Link>
                                    <p className="text-gray-500 mt-1">{product.description ? product.description.slice(0,50) + '...' : product.description}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold text-gray-900">{product.price}</p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <div className="text-yellow-400">★★★★</div>
                                        <div className="text-gray-300">★</div>
                                        <span className="text-sm text-gray-600 ml-1">(42)</span>
                                    </div>
                                </div>

                                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                </div>
            ))}
        </div>
    );
}