import prisma from '@/app/libs/prismadb';

import getSession from './getSession';

const currentUser = async () => {
    try{
        const session = await getSession(); // Get the current session of the user 

        if(!session?.user?.email) return null; // If the user is not logged in, return null 

        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email as string
            }
        }); // Get the current user from the database 

        if(!currentUser) return null; // If the user is not found, return null 

        return currentUser; // Return the current user
    } 
    catch(error : any){
        console.error(error);
        return null;
    } // Catch any error and return null 
} // Get the current user 

export default currentUser; 