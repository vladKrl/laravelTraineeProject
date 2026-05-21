import {useRouter} from "next/navigation";
import Button from "../Button";
import api from "../../../utils/api";
import {useAuth} from "../../hooks/auth";

export default function ContactWithSeller ({ productId }) {
    const { user } = useAuth();
    
    const router = useRouter();

    const startConversation = async () => {
        if (!user) {
            router.push('/login');

            return;
        }

        try {
            const response = await api.post('/api/conversations', {
                product_id: productId,
                body: "Hello! Interested in your product",
            });

            router.push(`/conversations/${response.data.data.id}`);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Button onClick={startConversation}>
            Contact seller
        </Button>
    );
}