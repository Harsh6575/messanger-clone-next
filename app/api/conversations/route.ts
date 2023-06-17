import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(); // get current user from session cookie
    const body = await request.json(); // get body from request
    const { userId, isGroup, members, name } = body; // get userId, isGroup, members, name from body

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 400 });
    } // check if user is logged in or not

    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse("Invalid data", { status: 400 });
    } // check if group data is valid or not

    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })), // connect all members to group  
              {
                id: currentUser.id,
              }, // connect current user to group 
            ],
          },
        },
        include: {
          users: true,
        }, // include users in response 
      }); // create new conversation with group data and current user id
      return NextResponse.json(newConversation); // return new conversation
    }

    const existingConversations = await prisma.conversation.findMany({
      where:{
        OR:[
          {
            userIds:{
              equals: [currentUser.id, userId]
            }
          }, // check if conversation exists between current user and selected user
          {
            userIds:{
              equals: [userId, currentUser.id]
            } // check if conversation exists between selected user and current user
          }
        ]
      }
    }); // get existing conversations between current user and selected user or selected user and current user 

    const singleConversation = existingConversations[0]; // get first conversation from existing conversations array

    if (singleConversation) {
      return NextResponse.json(singleConversation);
    } // if conversation exists then return conversation 

    const newConversation = await prisma.conversation.create({
      data:{
        users:{
          connect:[
            {
              id: currentUser.id
            }, // connect current user to conversation
            {
              id: userId
            } // connect selected user to conversation
          ]
        }
      }, // create new conversation with current user and selected user 
      include:{
        users: true
      } // include users in response 
    });

    return NextResponse.json(newConversation); // return new conversation

  } catch (error: any) {
    return new NextResponse("Internal Error", { status: 500 });
  } // catch and return error if any
}