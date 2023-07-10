import prisma from "@/app/libs/prismadb";

const getMessages = async (
  conversationId: string
) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        sender: true,
        seen: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    }); // Get messages by conversation id (from prisma) (with sender and seen) (ordered by createdAt) 

    return messages; // Return messages (with sender and seen) (ordered by createdAt)
  } catch (error: any) {
    return []; // Return empty array (no messages)
  }
};

export default getMessages;
