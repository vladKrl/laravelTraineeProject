'use client'

import ProductList from "../components/products/ProductList";
import React, {Suspense} from 'react';

export default function ProductsPage() {
    return (
        <main style={{padding: 20}}>
            <h1 className={"font-bold"}>Products</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <ProductList/>
            </Suspense>
        </main>
    );
}