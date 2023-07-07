import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(); // Get current user from session 
    const body = await request.json(); // Get body from request     
    const { name, image } = body; // Get name and image from body   

    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    } // Check if user is logged in 

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        image: image,
        name: name,
      },
    }); // Update user with new name and image 

    return NextResponse.json(updatedUser); // Return updated user 
  } catch (error) {
    console.log(error, "ERROR_MESSAGES in api/settings/route"); // Log error message
    return new NextResponse("Error", { status: 500 });
  }
}
