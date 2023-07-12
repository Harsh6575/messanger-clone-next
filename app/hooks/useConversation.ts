import { useParams } from "next/navigation";
import { useMemo } from "react";

const useConversation = () => {
    const params = useParams(); // Get the params of the url 

    const conversationId = useMemo(() => {
        if(!params?.conversationId) return ''; // If the conversationId is not found, return an empty string 

        return params.conversationId as string; // Return the conversationId 
    }, [params?.conversationId]); // Get the conversationId from the params of the url

    const isOpen = useMemo(() => !!conversationId, [conversationId]); // Check if the conversationId is not null 

    return useMemo(() => ({
        conversationId,
        isOpen
    }), [conversationId, isOpen]); // Return the conversationId and isOpen 
};

export default useConversation;