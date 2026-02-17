import ProductList from "../components/products/ProductList";

export default function ProductsPage() {
    return (
        <main style={{padding: 20}}>
            <h1 className={"font-bold"}>Products</h1>
            <ProductList/>
        </main>
    );
}