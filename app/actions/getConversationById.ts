import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getConversationById = async (conversationId: string) => {
  try {
    const currentUser = await getCurrentUser(); // Get current user hook

    if (!currentUser?.email) {
      return null;
    } // If no current user, return null (no conversation) (should not happen)

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    }); // Get conversation by id (from prisma) (with users)

    return conversation; // Return conversation (with users)
  } catch (error: any) {
    console.log(error, "SERVER_ERROR"); // Log error
    return null; // Return null (no conversation)
  }
}; 

export default getConversationById;
