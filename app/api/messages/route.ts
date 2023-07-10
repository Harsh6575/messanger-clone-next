import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

import { pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(); // Get current user from session
    const body = await request.json(); // Get request body from request object
    const { message, image, conversationId } = body; // Destructure body object

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    } // Check if user is logged in or not

    const newMessage = await prisma.message.create({
      include: {
        seen: true,
        sender: true,
      },
      data: {
        body: message,
        image: image,
        conversation: {
          connect: { id: conversationId },
        },
        sender: {
          connect: { id: currentUser.id },
        },
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    }); // Create new message in database and connect it to the current user and conversation

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    }); // Update conversation in database and connect it to the new message

    await pusherServer.trigger(conversationId, "messages:new", newMessage); // Trigger event to all users in the conversation

    const lastMessage =
      updatedConversation.messages[updatedConversation.messages.length - 1]; // Get last message from updated conversation

    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, "conversation:update", {
        id: conversationId,
        messages: [lastMessage],
      });
    }); // Trigger event to all users in the conversation

    return NextResponse.json(newMessage); // Return new message
  } catch (error) {
    console.log(error, "ERROR_MESSAGES"); // Log error
    return new NextResponse("Error", { status: 500 }); // Return error
  }
}
