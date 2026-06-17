"use client"

import React, {Suspense, useEffect} from 'react';
import "../app/styles/global.css";
import Button from "./components/Button";
import {useAuth} from "./hooks/auth";
import {useSearchParams} from "next/navigation";
import {mutate} from "swr";
import Link from "next/link";

function HomeContent() {
    const searchParams = useSearchParams();

    const { user, isLoading} = useAuth();

    useEffect(() => {
        if (searchParams.get('verified') === '1') {
            mutate();
        }
    }, [searchParams]);

    return (
        <div className={"flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12"}>
            {isLoading ? (
                <div className={"p-10 text-center"}>Loading...</div>
            ) :
                user ? (
                    <div className={"space-y-6 max-w-4xl"}>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                            Welcome to <span className="text-purple-900">KUFAR CLONE</span>, {user.name}!
                        </h1>
                        <div className="flex justify-center gap-4 pt-4">
                            <Link href="/products">
                                <Button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg">
                                    Search products
                                </Button>
                            </Link>
                            <Link href={`/profile/${user.id}`}>
                                <Button className={"px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg"}>
                                    Your profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className={"space-y-6 max-w-5xl"}>
                        <h1 className={"text-5xl font-extrabold text-gray-900 tracking-tight"}>
                            Search products and publish yours! <br/>
                        </h1>
                        <p className={"text-2xl text-gray-800"}>
                            Join our platform to search for new products at good prices and sell your products!
                        </p>
                        <div className={"flex justify-center gap-4 pt-4"}>
                            <Link href="/login">
                                <Button className={"shadow-lg"}>
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className={"shadow-lg"}>
                                    Register
                                </Button>
                            </Link>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default function Home() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}
