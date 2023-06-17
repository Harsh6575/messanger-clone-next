import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { FullConversationType } from "../types";
import { User } from "@prisma/client";

const useOtherUser = (conversation: FullConversationType | { users: User[] }) => {
  const session = useSession(); // get current user from session

  const otherUser = useMemo(() => {
    const currentUserEmail = session.data?.user?.email; // get current user email from session data

    const otherUser = conversation.users.filter((user) => user.email !== currentUserEmail); // filter out current user from conversation users array

    return otherUser[0]; // return the other user
  }, [session.data?.user?.email, conversation.users]); // re-run this function if the current user email or conversation users array changes

  return otherUser; // return the other user
}; 

export default useOtherUser;