import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getConversations = async () => {
  const currentUser = await getCurrentUser(); // Get current user from local storage

  if (!currentUser?.id) {
    return [];
  } // If no current user, return empty array

  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: 'desc',
      }, // Order by last message date (desc) 
      where: {
        userIds: {
          has: currentUser.id
        }
      }, // Where current user is in the conversation user ids array
      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true,
          }
        }, // Include users and messages in the response
      }
    }); // Get all conversations from database with users and messages

    return conversations; // Return conversations
  } catch (error: any) {
    return [];
  } // If error, return empty array
};

export default getConversations;
