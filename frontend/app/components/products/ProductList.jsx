'use client'

import ProductCard from "./ProductCard";

export default function ProductList({ products, loading, error }) {
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