import {useRouter} from "next/navigation";
import Button from "../Button";
import api from "../../../utils/api";

export default function ContactWithSeller ({ productId }) {
    const router = useRouter();

    const startConversation = async () => {
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