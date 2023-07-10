import { useEffect, useState } from "react";
import { pusherClient } from "../libs/pusher";
import { Channel, Members } from "pusher-js";
import useActiveList from "./useActiveList";

const useActiveChannel = () => {
  const { set, add, remove } = useActiveList(); // Custom hook to manage active list (see below)
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null); // Active channel state (null by default)

  useEffect(() => {
    let channel = activeChannel; // Get active channel from state (null by default)

    if (!channel) {
      channel = pusherClient.subscribe('presence-messenger');
      setActiveChannel(channel);
    } // If no active channel, subscribe to channel (presence-messenger) and set active channel state

    channel.bind("pusher:subscription_succeeded", (members: Members) => {
      const initialMembers: string[] = [];

      members.each((member: Record<string, any>) => initialMembers.push(member.id));
      set(initialMembers);
    }); // When subscription succeeds, get initial members and set active list state (see below) 

    channel.bind("pusher:member_added", (member: Record<string, any>) => {
      add(member.id)
    }); // When a member is added, add member to active list state (see below) 

    channel.bind("pusher:member_removed", (member: Record<string, any>) => {
      remove(member.id);
    });   // When a member is removed, remove member from active list state (see below) 

    return () => {
      if (activeChannel) {
        pusherClient.unsubscribe('presence-messenger');
        setActiveChannel(null);
      }
    } // When component unmounts, unsubscribe from channel (presence-messenger) and set active channel state to null
  }, [activeChannel, set, add, remove]); // When active channel changes, subscribe to channel (presence-messenger) and set active channel state
}

export default useActiveChannel;
