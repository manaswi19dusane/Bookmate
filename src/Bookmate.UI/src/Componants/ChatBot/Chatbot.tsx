import { useState } from "react";
import ChatbotButton from "../ChatBot/ChatbotButton";
import ChatbotWindow from "../ChatBot/ChatbotWindow";
import "../../css/chatbot.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function Chatbot({ open, onClose, onOpen }: Props) {
  return (
    <>
      {/* FLOATING BUTTON */}
      {!open && <ChatbotButton onClick={onOpen} />}

      {/* CHAT WINDOW */}
      {open && <ChatbotWindow onClose={onClose} />}
    </>
  );
}
