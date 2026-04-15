import Link from "next/link";
import {useAuth} from "../../hooks/auth";
import LikeButton from "../favorites/LikeButton";
import ContactWithSeller from "./ContactWithSeller";

export default function ProductCard({ product }) {
    const { user } = useAuth();

    const mainImage = product.main_image || null;

    const isArchived = product.status === 'archived';

    const mainImageUrl = mainImage ? mainImage.path : 'https://placehold.co/400x300';

    const categories = product.categories || [];

    return (
        <div className={"max-w-sm w-full bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all flex flex-col h-full"}>
            <div className="relative">
                <img
                    src={mainImageUrl}
                    alt={product.label}
                    className="w-full h-52 object-cover"
                />

                {isArchived && (
                    <div className={"absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 backdrop-blur-[4px]"}>
                        <span className={"bg-white/70 text-gray-900 px-5 py-2 rounded-full font-bold uppercase tracking-wider text-sm shadow-lg"}>
                            Archived
                        </span>
                    </div>
                )}

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

                {Number(product.user_id) !== Number(user?.id) && (
                    <div className={"flex gap-3"}>
                        <LikeButton productId={product.id} initialIsFavorite={product.is_favorite} />
                        <ContactWithSeller productId={product.id} />
                    </div>
                )}
            </div>
        </div>
    );
}