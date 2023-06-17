import prisma from '@/app/libs/prismadb';

import getSession from './getSession';

const getUsers = async () => {
    const session = await getSession(); // Get the current session of the user 

    if (!session?.user?.email) {
        return [];
    } // If the user is not logged in, return null

    try{
        const users = await prisma.user.findMany({
            orderBy:{
                createdAt: 'desc'
            }, // Order the users by the date they were created 
            where:{
                NOT:{
                    email: session.user.email
                }
            } // Do not return the user who is logged in 
        }); // Get all the users from the database except the user who is logged in 

        return users; // Return the users
    }catch(error: any){ 
        console.log(error);
        return [];
    } // Catch any error and return an empty array
}; // Get all the users from the database except the user who is logged in

export default getUsers;