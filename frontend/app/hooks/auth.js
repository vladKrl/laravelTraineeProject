import useSWR from 'swr'
import api from "../../utils/api";
import {useState} from "react";

export const useAuth = () => {

    const [isLoading, setIsLoading] = useState(true);

    const {data: user, error, mutate}  = useSWR("/api/v1/user",
        () => api
        );

    return {
        user,
        csrf,
        isLoading,
        login,
        logout
    }
}