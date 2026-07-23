import useSWR from 'swr'
import api from "../../utils/api";
import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";

export const useAuth = ({middleware} = {}) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    const csrf = () => api.get("/sanctum/csrf-cookie");

    const {data: user, error, mutate}  = useSWR("/api/user",
        () => api
            .get("/api/user")
            .then(response => response.data.data)
            .catch(error => {
                if (error.response?.status !== 409)
                    throw error;
            })
        );

    const login = async ({setErrors, ...props}) => {
        setErrors([]);

        try {
            await csrf();

            await api.post("/login", props);

            await mutate();

            router.push("/");
        } catch (error) {
            if (error?.response) {
                const status = error.response.status;

                if (status === 422) {
                    const responseErrors = error.response?.data?.errors;

                    setErrors(
                        responseErrors
                            ? Object.values(responseErrors).flat()
                            : [error.response?.data?.message || 'Invalid Credentials.']
                    );
                } else if (status === 429) {
                    const retryAfter = error.response.headers?.get?.('retry-after');

                    const message = retryAfter
                        ? `Too many attempts. Please, wait for ${retryAfter} sec.`
                        : (error.response?.data?.message || 'Too many attempts. Try again later.');

                    setErrors([message]);
                } else
                    throw error;
            } else if (error.request) {
                console.error("Server is not answering.");

                setErrors(["Server is not available."]);
            } else
                throw error;
        }
    }

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Logout has failed.", error);
        } finally {
            await mutate(null);

            router.push("/");
        }
    }

    const register = async ({ setErrors, ...props}) => {
        setErrors([]);

        try {
            await csrf();

            await api.post("/register", props);

            await mutate();

            router.push("/");
        } catch (error) {
            if (error?.response) {
                const status = error.response.status;

                if (status === 422) {
                    const responseErrors = error.response?.data?.errors;

                    setErrors(
                        responseErrors
                            ? Object.values(responseErrors).flat()
                            : [error.response?.data?.message || 'Invalid Credentials.']
                    );
                } else if (status === 429) {
                    const retryAfter = error.response.headers?.get?.('retry-after');

                    const message = retryAfter
                        ? `Too many attempts. Please, wait for ${retryAfter} sec.`
                        : (error.response?.data?.message || 'Too many attempts. Try again later.');

                    setErrors([message]);
                } else
                    throw error;
            } else if (error.request) {
                console.error("Server is not answering.");

                setErrors(["Server is not available."]);
            } else
                throw error;
        }
    }

    const resendEmailVerification = async ({ setStatus, setErrors }) => {
        setErrors([]);
        setStatus(null);

        try {
            const response = await api.post('/email/verification-notification');

            setStatus(response.data.status);
        } catch (error) {
            if (error?.response) {
                const status = error.response.status;

                if (status === 429) {
                    const retryAfter = error.response.headers?.get?.('retry-after');

                    const message = retryAfter
                        ? `Too many attempts. Please, wait for ${retryAfter} sec.`
                        : (error.response?.data?.message || 'Too many attempts. Try again later.');

                    setErrors([message]);
                } else
                    throw error;
            } else if (error.request) {
                console.error("Server is not answering.");

                setErrors(["Server is not available."]);
            } else
                throw error;
        }
    };

    useEffect(() => {
        if (user || error) {
            setIsLoading(false);
        }

        if (user) {
            if (middleware === 'auth' && !user.email_verified_at)
                router.push('/verify-email');

            if (middleware === 'auth' && user.email_verified_at && pathname === '/verify-email')
                router.push('/');

            if (middleware === 'guest') {
                if (!user.email_verified_at)
                    router.push("/verify-email");
                else
                    router.push("/");
            }
        }

        if (middleware === "auth" && error)
            router.push("/login");
    },[user, error, middleware, pathname]);

    return {
        user,
        csrf,
        isLoading,
        login,
        logout,
        register,
        resendEmailVerification
    }
}