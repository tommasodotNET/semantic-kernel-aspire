// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Button, ToggleButton } from "@fluentui/react-components";
import {
    AIChatMessage,
    AIChatProtocolClient,
    AIChatError,
} from "@microsoft/ai-chat-protocol";
import { useEffect, useId, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";
import styles from "./Chat.module.css";
import gfm from "remark-gfm";

type ChatEntry = (AIChatMessage & { dataUrl?: string }) | AIChatError;

function isChatError(entry: unknown): entry is AIChatError {
    return (entry as AIChatError).code !== undefined;
}

interface FileInput {
    data: Uint8Array;
    name: string;
    type: string;
}

function toBase64DataUrl(
    arr?: Uint8Array,
    contentType?: string,
): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
        if (!arr) {
            resolve(undefined);
            return;
        }
        const blob = new Blob([arr], { type: contentType });
        const reader = new FileReader();

        reader.onerror = reject;
        reader.onload = (event) => {
            resolve(event.target?.result as string);
        };
        reader.readAsDataURL(blob);
    });
}

// ...existing imports...

export default function Chat({ style }: { style: React.CSSProperties }) {
    const client = new AIChatProtocolClient("/agent/chat/");

    const [messages, setMessages] = useState<ChatEntry[]>([]);
    const [input, setInput] = useState<string>("");
    const inputId = useId();
    const [sessionState, setSessionState] = useState<unknown>(undefined);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const result = await client.getStreamedCompletion([], {
                    sessionState: sessionState,
                });
                const latestMessage: AIChatMessage = { content: "", role: "assistant" };
                for await (const response of result) {
                    if (response.sessionState) {
                        setSessionState(response.sessionState);
                    }
                    if (!response.delta) {
                        continue;
                    }
                    if (response.delta.role) {
                        latestMessage.role = response.delta.role;
                    }
                    if (response.delta.content) {
                        latestMessage.content += response.delta.content;
                        setMessages([latestMessage]);
                    }
                }
            } catch (e) {
                if (isChatError(e)) {
                    setMessages([{ code: e.code, message: e.message }]);
                }
            }
        };

        fetchInitialData();
    }, []); // Empty dependency array ensures this runs only once on mount

    const sendMessage = async () => {
        const message: AIChatMessage = {
            role: "user",
            content: input,
        };
        const updatedMessages: ChatEntry[] = [...messages, message];
        setMessages(updatedMessages);
        setInput("");
        try {
            // Build the conversation from updatedMessages, filtering out errors
            const conversation = updatedMessages
                .filter((entry) => !isChatError(entry))
                .map((msg) => msg as AIChatMessage);

            const result = await client.getStreamedCompletion(conversation, {
                sessionState: sessionState,
            });

            console.log("result", result);

            const latestMessage: AIChatMessage = { content: "", role: "assistant" };
            for await (const response of result) {
                if (response.sessionState) {
                    setSessionState(response.sessionState);
                }
                if (!response.delta) {
                    continue;
                }
                if (response.delta.role) {
                    latestMessage.role = response.delta.role;
                }
                if (response.delta.content) {
                    latestMessage.content += response.delta.content;
                    setMessages([...updatedMessages, latestMessage]);
                }
            }
        } catch (e) {
            console.log("ERROR: ", e);

            if (isChatError(e)) {
                setMessages([...updatedMessages, e]);
            }
            else {
                setMessages([
                    ...updatedMessages,
                    { code: "unknown_error", message: e },
                ]);
            }
        }
    };

    const getClassName = (message: ChatEntry) => {
        if (isChatError(message)) {
            return styles.caution;
        }
        return message.role === "user"
            ? styles.userMessage
            : styles.assistantMessage;
    };

    const getErrorMessage = (message: AIChatError) => {
        return `${message.code}: ${message.message}`;
    };

    return (
        <div className={styles.chatWindow} style={style}>
            <div className={styles.messages}>
                {messages.map((message) => (
                    <div key={crypto.randomUUID()} className={getClassName(message)}>
                        {isChatError(message) ? (
                            <>{getErrorMessage(message)}</>
                        ) : (
                            <>
                                <div className={styles.messageBubble}>
                                    <ReactMarkdown remarkPlugins={[gfm]}>
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className={styles.inputArea}>
                <TextareaAutosize
                    id={inputId}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    minRows={1}
                    maxRows={4}
                />
                <Button onClick={sendMessage}>Send</Button>
            </div>
        </div>
    );
}