"use client";

import useConversation from "@/app/hooks/useConversation";
import { FullConversationType } from "@/app/types";
import { User } from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import { MdOutlineGroupAdd } from "react-icons/md";
import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface ConversationListProps {
  initialItems: FullConversationType[];
  users?: User[];
  title?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  initialItems,
  users,
  title,
}) => {
  const [items, setItems] = useState(initialItems); // items is the list of conversations
  const [isModalOpen, setIsModalOpen] = useState(false); // isModalOpen is used to open and close the modal 

  const router = useRouter(); // router is used to get the current url  path
  const session = useSession(); // session is used to get the current user session data

  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]); // pusher key is the user email 

  const { conversationId, isOpen } = useConversation(); // conversationId is the id of the conversation and isOpen is used to open and close the conversation

  useEffect(() => {
    if (!pusherKey) {
      return;
    } // if pusherKey is not available then return 

    pusherClient.subscribe(pusherKey); // subscribe to the pusher client with the pusher key 

    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) =>
        current.map((currentConversation) => {
          if (currentConversation.id === conversation.id) {
            return {
              ...currentConversation,
              messages: conversation.messages,
            };
          }

          return currentConversation;
        })
      );
    }; // updateHandler is used to update the conversation  with the new messages 

    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        if (find(current, { id: conversation.id })) {
          return current;
        }

        return [conversation, ...current];
      });
    }; // newHandler is used to add the new conversation to the list of conversations 

    const removeHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        return [...current.filter((convo) => convo.id !== conversation.id)];
      });

      if (conversationId === conversation.id) {
        router.push("/conversations");
      }

    }; // removeHandler is used to remove the conversation from the list of conversations 

    pusherClient.bind("conversation:update", updateHandler); // bind the updateHandler to the pusher client 
    pusherClient.bind("conversation:new", newHandler); // bind the newHandler to the pusher client 
    pusherClient.bind("conversation:remove", removeHandler); // bind the removeHandler to the pusher client

    return () => {
      pusherClient.unsubscribe(pusherKey); // unsubscribe from the pusher client with the pusher key
      pusherClient.unbind("conversation:update", updateHandler); // unbind the updateHandler from the pusher client
      pusherClient.unbind("conversation:new", newHandler); // unbind the newHandler from the pusher client
      pusherClient.unbind("conversation:remove", removeHandler); // unbind the removeHandler from the pusher client
    }; // return the pusher client
  }, [pusherKey, router]); // pusherKey and router are the dependencies of the useEffect hook

  return (
    <>
      <GroupChatModal
        users={users}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <aside
        className={clsx(
          `fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200 `,
          isOpen ? "hidden" : "block w-full left-0"
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-neutral-800">Messages</div>
            <div
              onClick={() => setIsModalOpen(true)}
              className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
            >
              <MdOutlineGroupAdd size={20} />
            </div>
          </div>
          {items.map((item) => (
            <ConversationBox
              key={item.id}
              data={item}
              selected={conversationId === item.id}
            />
          ))}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;
