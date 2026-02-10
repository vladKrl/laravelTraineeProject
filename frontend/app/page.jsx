import React from 'react';

export default async function Page() {
    const base = process.env.NEXT_PUBLIC_API_URL_SERVER;

    const res = await fetch(`${base}/products`, { cache: 'no-store' });

    if (!res.ok) {
        throw new Error('Failed to fetch products list: ' + res.status);
    }

    const json = await res.json();
    const raw = json?.data ?? json;
    const products = Array.isArray(raw) ? raw : (raw ? [raw] : []);

    return (
        <main style={{ padding: 20 }}>
            <h1>Products</h1>
            <div>
                {products.map(p => (
                    <div key={p.id}>
                        <strong>{p.label}</strong> — {p.price}
                    </div>
                ))}
            </div>
        </main>
    );
}
// export default function Page() {
//     return (
//         <main style={{ padding: 32, fontFamily: 'sans-serif' }}>
//             <h1>Next App Router works!</h1>
//             <p>This is app/page.jsx</p>
//         </main>
//     )
// }