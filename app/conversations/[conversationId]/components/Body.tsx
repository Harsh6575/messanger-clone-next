"use client";

import useConversation from "@/app/hooks/useConversation";
import { FullMessageType } from "@/app/types";
import React, { useEffect } from "react";
import MessageBox from "./MessageBox";
import axios from "axios";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body: React.FC<BodyProps> = ({ initialMessages }) => {
  const [messages, setMessages] =
    React.useState<FullMessageType[]>(initialMessages); 

  const bottomRef = React.useRef<HTMLDivElement>(null); // ref to the last message in the conversation body

  const { conversationId } = useConversation(); // get the conversation id from the url

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]); // mark the conversation as seen when the component is mounted and the conversation id changes (when the user navigates to a different conversation)

  useEffect(() => {
    pusherClient.subscribe(conversationId); // subscribe to the pusher channel for the current conversation id to receive new messages and updates to existing messages (e.g. when a message is edited) in real time (using pusher)   
    bottomRef?.current?.scrollIntoView(); // scroll to the last message in the conversation body when the component is mounted and the conversation id changes (when the user navigates to a different conversation) 

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`); // mark the conversation as seen when a new message is received

      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        } // if the message already exists in the conversation body, don't add it again (this is to prevent duplicate messages from being added to the conversation body when the user is in the conversation)

        return [...current, message]; // add the new message to the conversation body if it doesn't already exist in the conversation body 
      }); // set the conversation body to the current conversation body plus the new message

      bottomRef?.current?.scrollIntoView(); // scroll to the last message in the conversation body when a new message is received
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          } // if the message already exists in the conversation body, update it with the new message (this is to update the message in the conversation body when the user edits the message)

          return currentMessage; // return the current message if it doesn't already exist in the conversation body
        })
      );
    }; // set the conversation body to the current conversation body with the updated message 

    pusherClient.bind("messages:new", messageHandler); // bind the messageHandler function to the "messages:new" event (this is to receive new messages in real time) 
    pusherClient.bind("message:update", updateMessageHandler); // bind the updateMessageHandler function to the "message:update" event (this is to receive updates to existing messages in real time) 

    return () => {
      pusherClient.unsubscribe(conversationId); // unsubscribe from the pusher channel for the current conversation id when the component is unmounted (when the user navigates away from the conversation)
      pusherClient.unbind("messages:new", messageHandler); // unbind the messageHandler function from the "messages:new" event when the component is unmounted
      pusherClient.unbind("message:update", updateMessageHandler); // unbind the updateMessageHandler function from the "message:update" event when the component is unmounted 
    };
  }, [conversationId]); // subscribe to the pusher channel for the current conversation id when the component is mounted and the conversation id changes (when the user navigates to a different conversation) 

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          data={message}
        />
      ))}
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export default Body;
