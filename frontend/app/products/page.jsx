'use client'

import ProductList from "../components/products/ProductList";
import React from 'react';
import "../styles/global.css";


export default function ProductsPage() {
    return (
        <main style={{padding: 20}}>
            <h1 className={"font-bold"}>Products</h1>
            <ProductList/>
        </main>
    );
}