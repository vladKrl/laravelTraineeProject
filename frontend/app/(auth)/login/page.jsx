"use client";

import React, {useState} from "react";
import "../../styles/global.css";
import {useAuth} from "../../hooks/auth";
import Layout from "../../components/Layouts";
import Label from "../../components/Label";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Errors from "../../components/Errors";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);

    const {login, isLoading, user} = useAuth({middleware: "guest"});

    if (isLoading || user) {
        return (
            <>Is loading...</>
        )
    }

    const submitForm = async e => {
        e.preventDefault();

        await login({email, password, setErrors});
    }

    return (
        <Layout>
                <div className={"w-1/4 mx-auto bg-white shadow p-1 rounded"}>

                    <Errors errors={errors} />

                    <form onSubmit={submitForm} autoComplete={"off"} className={"space-y-5"}>
                        <div>
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id={"email"}
                                type={"email"}
                                value={email}
                                className={"w-full"}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus
                                autoComplete={"off"}
                            />
                        </div>

                        <div>
                                <Label htmlFor="password">Password</Label>
                            <Input
                                id={"password"}
                                type={"password"}
                                value={password}
                                className={"w-full"}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete={"off"}
                            />
                        </div>

                        <div className="">
                            <Button>Login</Button>
                        </div>
                    </form>
                </div>
        </Layout>
    )
}

export default Login;
