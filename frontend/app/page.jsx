"use client"

import React from 'react';
import Layout from "./components/Layouts";
import Button from "./components/Button";
import Input from "./components/Input";
import Label from "./components/Label";
import "../app/styles/global.css";

const Home = () => {
    return (
        <Layout>
            <h1>Home page!</h1>
            <Button>Login</Button>
            <Input />
            <Label>Test text</Label>
        </Layout>
    )
}

export default Home;
