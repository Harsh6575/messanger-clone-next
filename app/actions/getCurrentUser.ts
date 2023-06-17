import prisma from '@/app/libs/prismadb';

import getSession from './getSession';

const currentUser = async () => {
    try{
        const session = await getSession();

        if(!session?.user?.email) return null;

        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email as string
            }
        });

        if(!currentUser) return null;

        return currentUser;
    }
    catch(error : any){
        console.error(error);
        return null;
    }
}

export default currentUser;