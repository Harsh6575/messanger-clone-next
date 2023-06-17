import bcrypt from 'bcrypt';
import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';


export async function POST (
    request: Request,
){
    try{

        const body = await request.json(); // Get the body of the request 
        const { email,name, password } = body; // Get the email, name and password from the body of the request 
        
        if(!email || !name || !password){
            return new NextResponse("Missing info",{status: 400});
        } // If the email, name or password is missing, return a 400 error 
        
        const hashedPassword = await bcrypt.hash(password,12); // Hash the password 
        
        const user = await prisma.user.create({
            data:{  
                email,
                name,
                hashedPassword,
            },
        }); // Create the user in the database and return the user 
        
        return NextResponse.json(user); // Return the user 
    }
    catch(error: any){
        console.log(error,"Register error");
        return new NextResponse("Something went wrong",{status: 500});
    } // Catch any error and return a 500 error
}