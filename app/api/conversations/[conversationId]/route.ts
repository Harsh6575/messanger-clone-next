import { NextResponse } from "next/server";
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { pusherServer } from "@/app/libs/pusher";

interface IParams{
    conversationId?: string;
}

export async function DELETE (
    request: Request,
    {params}: {params: IParams}
){
    try{
        const {conversationId} = params; // get conversationId from params
 
        const currentUser = await getCurrentUser(); // get current user from session

        if(!currentUser){
            return new NextResponse('Unauthorized', {status: 401}); // if no current user, return unauthorized error
        }

        const existingConversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include:{
                users: true
            }
        }); // get conversation from database by conversationId and include users in the conversation object 

        if(!existingConversation){
            return new NextResponse('Not Found', {status: 404});
        }; // if no conversation found, return not found error 

        const deletedConversation = await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userIds: {
                    hasSome: [currentUser.id]
                }
            }
        }); // delete conversation from database by conversationId and userIds (check if current user is in the conversation)

        existingConversation.users.forEach((user) => {
            if (user.email) {
              pusherServer.trigger(user.email, 'conversation:remove', existingConversation);
            }
          }); // trigger pusher event to all users in the conversation to remove the conversation from their conversation list 

        return NextResponse.json(deletedConversation);  // return deleted conversation object
    }
    catch(error: any){
        console.log(error),"Error in DELETE /api/conversations/[conversationId]/route.ts"; // log error message in console 
        return new NextResponse('Internal Server Error', {status: 500});
    }
}