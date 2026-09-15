"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessageCircle, Minus, Send, X } from "lucide-react";
import {
  CONTINUE,
  isEmailError,
  isPhoneError,
  type ContactPayload,
  toApiBody,
  validateCompany,
  validateContactPayload,
  validateEmail,
  validateMessage,
  validateName,
  validatePhone,
} from "./contactValidation";

type MessageRole = "bot" | "user";

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
};

type Step = "name" | "email" | "company" | "phone" | "message" | "complete";

const EMPTY_FORM: ContactPayload = {
  name: "",
  email: "",
  company: "",
  phone: "",
  designation: "",
  message: "",
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function BotAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? 28 : 36;
  return (
    <Image
      src="/assets/zerof_bot.png"
      alt=""
      width={dim}
      height={dim}
      className="shrink-0 rounded-full shadow-sm"
      aria-hidden
    />
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <BotAvatar size="sm" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-neutral-100 px-4 py-3 dark:bg-white/8">
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot animation-delay-150" />
        <span className="chat-typing-dot animation-delay-300" />
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isBot = message.role === "bot";
  return (
    <div
      className={`flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-400 ${
        isBot ? "justify-start" : "justify-end"
      }`}
    >
      {isBot ? <BotAvatar size="sm" /> : null}
      <div
        className={`max-w-[82%] px-4 py-2.5 text-[13px] leading-relaxed ${
          isBot
            ? "rounded-2xl rounded-bl-md bg-neutral-100 text-neutral-800 dark:bg-white/8 dark:text-neutral-100"
            : "rounded-2xl rounded-br-md bg-primary text-white shadow-sm"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

export function ContactChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<Step>("name");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);
  const formDataRef = useRef<ContactPayload>({ ...EMPTY_FORM });

  const updateFormData = useCallback((patch: Partial<ContactPayload>) => {
    formDataRef.current = { ...formDataRef.current, ...patch };
  }, []);

  const resetFormData = useCallback(() => {
    formDataRef.current = { ...EMPTY_FORM };
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  const addBotMessages = useCallback(
    async (texts: string[], delay = 650) => {
      setIsTyping(true);
      scrollToBottom();
      await new Promise((r) => setTimeout(r, delay));
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        ...texts.map((text) => ({ id: uid(), role: "bot" as const, text })),
      ]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  const addUserMessage = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { id: uid(), role: "user", text }]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  const showValidationError = useCallback(
    async (userValue: string, error: string, continueMsg: string) => {
      addUserMessage(userValue);
      setInput("");
      await addBotMessages([error, continueMsg], 500);
    },
    [addBotMessages, addUserMessage]
  );

  const submitToApi = useCallback(
    async (data: ContactPayload): Promise<{ ok: boolean; error?: string }> => {
      const validationError = validateContactPayload(data);
      if (validationError) return { ok: false, error: validationError };

      setIsSubmitting(true);
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toApiBody(data)),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          return {
            ok: false,
            error:
              typeof result.error === "string"
                ? result.error
                : "Something went wrong. Please try again.",
          };
        }
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: "Unable to submit. Please check your connection and try again.",
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const finishSubmission = useCallback(
    async (data: ContactPayload) => {
      await addBotMessages(["Thank you! We're submitting your details..."], 700);
      const result = await submitToApi(data);

      if (result.ok) {
        setStep("complete");
        await addBotMessages(
          [
            "Thank you — we will get back to you shortly. Our team typically responds within one business day.",
            "Have a great day! 🛡️",
          ],
          900
        );
        return;
      }

      if (isPhoneError(result.error ?? "")) {
        updateFormData({ phone: "" });
        setStep("phone");
        setInput("");
        await addBotMessages(
          [result.error ?? "Phone number not valid.", CONTINUE.phone],
          500
        );
      } else if (isEmailError(result.error ?? "")) {
        updateFormData({ email: "" });
        setStep("email");
        setInput("");
        await addBotMessages(
          [result.error ?? CONTINUE.email],
          500
        );
      } else {
        setStep("message");
        setInput(data.message);
        await addBotMessages(
          [
            result.error ?? "We couldn't submit your details right now.",
            CONTINUE.message,
          ],
          700
        );
      }
    },
    [addBotMessages, submitToApi, updateFormData]
  );

  const startConversation = useCallback(async () => {
    setMessages([]);
    setStep("name");
    resetFormData();
    setInput("");
    await addBotMessages(
      [
        "👋 Welcome to ZerofAI!",
        "I'm here to help you. Let's get started — what is your name?",
      ],
      800
    );
  }, [addBotMessages, resetFormData]);

  useEffect(() => {
    if (isOpen && !isMinimized && !initializedRef.current) {
      initializedRef.current = true;
      void startConversation();
    }
  }, [isOpen, isMinimized, startConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized && step !== "complete") {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, step, isTyping]);

  const handleSend = async () => {
    const value = input.trim();
    if (!value || isTyping || isSubmitting || step === "complete") return;

    if (step === "name") {
      const err = validateName(value);
      if (err) {
        await showValidationError(value, err, CONTINUE.name);
        return;
      }
      addUserMessage(value);
      updateFormData({ name: value.trim() });
      setInput("");
      setStep("email");
      await addBotMessages([
        `Great to meet you, ${value.split(" ")[0]}!`,
        "What is your work email address?",
      ]);
      return;
    }

    if (step === "email") {
      const err = validateEmail(value);
      if (err) {
        await showValidationError(value, err, CONTINUE.email);
        return;
      }
      addUserMessage(value);
      updateFormData({ email: value.trim().toLowerCase() });
      setInput("");
      setStep("company");
      await addBotMessages(["Which company do you work for?"]);
      return;
    }

    if (step === "company") {
      const err = validateCompany(value);
      if (err) {
        await showValidationError(value, err, CONTINUE.company);
        return;
      }
      addUserMessage(value);
      updateFormData({ company: value.trim() });
      setInput("");
      setStep("phone");
      await addBotMessages(["Perfect. What is your contact number?"]);
      return;
    }

    if (step === "phone") {
      const err = validatePhone(value);
      if (err) {
        await showValidationError(value, err, CONTINUE.phone);
        return;
      }
      addUserMessage(value);
      updateFormData({ phone: value.trim() });
      setInput("");

      if (formDataRef.current.message.trim()) {
        await finishSubmission({ ...formDataRef.current, designation: "" });
        return;
      }

      setStep("message");
      const firstName = formDataRef.current.name.split(" ")[0] || "there";
      await addBotMessages([
        `Got it, ${firstName}!`,
        "What IT challenges are you looking to solve?",
      ]);
      return;
    }

    if (step === "message") {
      const err = validateMessage(value);
      if (err) {
        await showValidationError(value, err, CONTINUE.message);
        return;
      }
      addUserMessage(value);
      const finalData = {
        ...formDataRef.current,
        message: value.trim(),
        designation: "",
      };
      updateFormData({ message: value.trim(), designation: "" });
      setInput("");
      await finishSubmission(finalData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    initializedRef.current = false;
  };

  const handleRestart = () => {
    initializedRef.current = false;
    void startConversation();
    initializedRef.current = true;
  };

  const placeholder =
    step === "name"
      ? "Enter your full name..."
      : step === "email"
        ? "you@company.com"
        : step === "company"
          ? "Your company name..."
          : step === "phone"
            ? "10-digit mobile number"
            : step === "message"
              ? "Tell us how we can help..."
              : "Conversation ended";

  const inputDisabled = step === "complete" || isTyping || isSubmitting;

  return (
    <>
      {!isOpen && (
        <button
        id="chatbotIcon"
          type="button"
          onClick={() => setIsOpen(true)}
          className="contact-chat-fab group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:scale-105  hover active:scale-95 sm:bottom-8 sm:right-8"
          aria-label="Open chat assistant"
        >
          <span className="contact-chat-fab-ping absolute inset-0 rounded-full bg-primary/40" aria-hidden />
          <MessageCircle className="relative h-6 w-6 transition-transform group-hover:scale-110" strokeWidth={2} />
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col overflow-hidden border border-neutral-200/80 bg-white shadow-2xl shadow-neutral-900/10 transition-all duration-300 dark:border-white/10 dark:bg-[#111] ${
            isMinimized
              ? "bottom-6 right-6 h-14 w-[min(100vw-2rem,360px)] rounded-2xl sm:bottom-8 sm:right-8"
              : "bottom-0 right-0 h-[min(100dvh,640px)] w-full rounded-t-2xl sm:bottom-8 sm:right-8 sm:h-[min(580px,85dvh)] sm:w-[min(100vw-2rem,400px)] sm:rounded-2xl"
          }`}
          role="dialog"
          aria-label="ZeroFAI chat assistant"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#111]">
            <div className="flex min-w-0 items-center gap-3">
              <BotAvatar />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  ZerofAI
                </p>
                <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                  {isTyping ? "Typing..." : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized((v) => !v)}
                className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-neutral-50/60 dark:bg-[#0d0d0d]">
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin">
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                <div className="shrink-0 border-t border-neutral-200/80 bg-white px-3 py-3 dark:border-white/10 dark:bg-[#111]">
                  {step === "complete" ? (
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="w-full rounded-xl border border-primary/30 bg-primary/5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                    >
                      Start a new conversation
                    </button>
                  ) : (
                    <div className="relative flex items-center">
                      <input
                        ref={inputRef}
                        type={step === "email" ? "email" : step === "phone" ? "tel" : "text"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={inputDisabled}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-4 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-neutral-500"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={!input.trim() || inputDisabled}
                        className="absolute right-1.5 grid h-9 w-9 place-items-center rounded-lg bg-primary text-white transition hover:bg-[#0090b3] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send message"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="mt-2 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-600">
                    Powered by ZeroFAI
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        .contact-chat-fab-ping {
          animation: chatFabPing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes chatFabPing {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          70%,
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .chat-typing-dot {
          display: block;
          height: 6px;
          width: 6px;
          border-radius: 9999px;
          background: #a3a3a3;
          animation: chatTypingBounce 1.2s ease-in-out infinite;
        }
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        @keyframes chatTypingBounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-in-from-bottom-2 {
          from {
            transform: translateY(8px);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes slide-in-from-bottom-3 {
          from {
            transform: translateY(12px);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-bottom-2 {
          animation-name: slide-in-from-bottom-2;
        }
        .slide-in-from-bottom-3 {
          animation-name: slide-in-from-bottom-3;
        }
        .duration-300 {
          animation-duration: 300ms;
        }
        .duration-400 {
          animation-duration: 400ms;
        }
      `}</style>
    </>
  );
}
