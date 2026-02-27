"use client"

import React, {useEffect} from 'react';
import "../app/styles/global.css";
import Layout from "./components/Layouts";
import Button from "./components/Button";
import Input from "./components/Input";
import Label from "./components/Label";
import {useAuth} from "./hooks/auth";
import {useSearchParams} from "next/navigation";
import {mutate} from "swr";


export default function Home() {
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('verified') === '1') {
            mutate();
        }
    }, [searchParams]);

    useAuth({ middleware: 'auth' });

    return (
        <Layout>
            <h1>Home page!</h1>
            <Button>Login</Button>
            <Input />
            <Label>Test text</Label>
        </Layout>
    )
}
