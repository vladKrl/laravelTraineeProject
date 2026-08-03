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
            if (error?.response) {
                const { status, data } = error.response;

                if (status === 422 || status === 409) {
                    const existingConversationId = data?.conversation_id;

                    if (existingConversationId) {
                        router.push(`/conversations/${existingConversationId}`);

                        return
                    }
                }

                throw error;
            } else if (error.request) {
                console.error("Server is not answering.");
            } else
                throw error;
        }
    }

    return (
        <Button onClick={startConversation}>
            Contact seller
        </Button>
    );
}