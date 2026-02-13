import useSWR from 'swr'
import api from "../../utils/api";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export const useAuth = ({middleware} = {}) => {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true); //temporary

    const csrf = () => api.get("/sanctum/csrf-cookie");

    const {data: user, error, mutate}  = useSWR("/api/user",
        () => api
            .get("/api/user")
            .then(response => response.data) //.data
            .catch(error => {
                if (error.response.status !== 409)
                    throw error
            })
        );

    const login = async ({setErrors, ...props}) => {
        setErrors([]);

        await csrf();

        await api.post("/api/login", props)
            .then(() => mutate() && router.push("/"))
            .catch(error => {
                if (error.response.status !== 422)
                    throw error

                setErrors(Object.values(error.response.data.errors).flat())
            })
    }

    const logout = async () => {
        await api.post("/api/logout");

        await mutate(null);

        await router.push("/")
    }

    useEffect(() => {
        if (user || error) {
            setIsLoading(false);
        }
        
        if (middleware === "guest" && user)
            router.push("/");
        
        if (middleware === "auth" && error)
            router.push("login");
    },[user, error]); //, middleware, router

    return {
        user,
        csrf,
        isLoading,
        login,
        logout
    }
}