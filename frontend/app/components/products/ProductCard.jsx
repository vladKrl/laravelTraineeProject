import Link from "next/link";
import {useAuth} from "../../hooks/auth";

export default function ProductCard({ product }) {
    const { user } = useAuth();

    const categories = product.categories || [];

    return (
        <div className={"max-w-sm w-full bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all flex flex-col h-full"}>
            <div className="relative">
                <img
                    src="https://placehold.co/400x300"
                    alt={product.label}
                    className="w-full h-52 object-cover"
                />
                <div className={"absolute top-2 left-2 flex flex-wrap gap-1"}>
                    {categories.map((category) => (
                        <span
                            key={category.id}
                            className={"bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm"}
                        >
                            {category.label}
                        </span>
                    ))}
                </div>
            </div>

            <div className={"p-5 space-y-4 flex flex-col flex-grow"}>
                <div>
                    <Link href={`/products/${product.id}`}>
                        <h3 className={"text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"}>
                            {product.label}
                        </h3>
                    </Link>
                    <p className={"text-gray-500 mt-1 text-sm line-clamp-2"}>
                        {product.description || 'Nothing to say.'}
                    </p>
                </div>

                <div className={"flex justify-between items-center mt-auto"}>
                    <p className="text-2xl font-bold text-gray-900">
                        {product.price} <span className="text-sm font-normal">CURRENCY</span>
                    </p>

                    <div className={"flex items-center gap-1"}>
                        <div className="text-yellow-400">★★★★</div>
                        <div className="text-gray-300">★</div>
                    </div>
                </div>

                {product.user_id !== user?.id && (
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors">
                        Add to cart
                    </button>
                )}
            </div>
        </div>
    );
}