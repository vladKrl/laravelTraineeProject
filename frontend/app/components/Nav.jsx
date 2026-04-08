import Link from "next/link";
import {useAuth} from "../hooks/auth";
import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Button from "./Button";
import FilterBox from "./FilterBox";

export default function Nav() {
    const {user, logout, isLoading} = useAuth();
    const [search, setSearch] = useState("");

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const router = useRouter();

    const searchParams = useSearchParams();

    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams(searchParams.toString());

        if (search.trim()) {
            params.set('search', search);
        } else {
            params.delete('search');
        }

        router.push(`/products?${params.toString()}`);
    }

    return (
        <nav className={"flex justify-between items-center p-4"}>
            <div>
                <ul className={"flex space-x-4"}>
                    <Link href={"/"} className={"mr-2 ml-2"}>Home</Link>
                    <Link href={"#"} className={"mr-2 ml-2"}>About</Link>
                    <Link href={"/products"} className={"mr-2 ml-2"}>Product Cards</Link>
                    {user && (
                        <div>
                            <Link href={"/conversations"} className={"mr-2 ml-2"}>Conversations</Link>
                        </div>
                    )}
                </ul>
            </div>

            <div className={"flex gap-20 items-center"}>
                <div>
                    {isLoading ? (
                        <div className="text-gray-600">Loading...</div>
                    ) : (
                        user ? (
                            <div className={"flex justify-between items-center"}>
                                <Link
                                    href={`/profile/${user.id}`}
                                    className={"flex items-center justify-center bg-rose-300 px-3 mx-2 rounded-sm"}
                                >
                                    <span className={"text-gray-600 text-[15px] hover:scale-140 hover:text-gray-800 inline-block"}>
                                        Hi, {user.name}!
                                    </span>
                                </Link>
                                <a
                                    href="#"
                                    className={"hover:font-bold"}
                                    onClick={logout}
                                >
                                    Sign Out
                                </a>
                            </div>
                            ) : (
                            <div>
                                <Link className={"mr-5"} href={"/login"}>
                                    Sign In
                                </Link>
                                <Link href={"/register"}>
                                    Register
                                </Link>
                            </div>
                        )
                    )}
                </div>

                <div>
                    <form onSubmit={handleSearch} className={"relative flex items-center"}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={"border border-gray-300 rounded-l-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 lg:w-64"}
                        />
                        <Button
                            type="submit"
                        >
                            🔍
                        </Button>
                    </form>
                </div>
                <Button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    {isFilterOpen ? 'Close' : 'Filters 🔍'}
                </Button>
            </div>
            {isFilterOpen && (
                <div className={"absolute top-20 right-0 bg-white shadow-xl z-50 p-4 border-b"}>
                    <div className={"container mx-auto"}>
                        <h3 className={"text-sm font-semibold mb-3 text-gray-500 uppercase"}>Choose the category:</h3>
                        <FilterBox />
                    </div>
                </div>
            )}
        </nav>
    );
}
