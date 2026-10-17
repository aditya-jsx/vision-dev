import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Step } from "../../lib/types";
import { parseXml } from "../../utils/parseXml";

export type ChatMessage = {
  type: "user" | "ai";
  content: string;
  steps?: Step[];
};

type ApiMessage = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

const userMessage = (text: string): ApiMessage => ({ role: "user", parts: [{ text }] });
const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "An unknown error occurred.");

// Talks to /api/skeleton and /api/chat. Generates the project from the stored
// prompt on mount, then turns each follow-up message into new steps.
export function useProjectChat(addSteps: (steps: Step[]) => Step[], onError: (message: string | null) => void) {
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const history = useRef<ApiMessage[]>([]);

  const log = (msg: ChatMessage) => setChatLog((prev) => [...prev, msg]);

  const fail = useCallback(
    (e: unknown) => {
      const message = errorMessage(e);
      onError(message);
      setChatLog((prev) => [...prev, { type: "ai", content: `An error occurred: ${message}` }]);
    },
    [onError]
  );

  useEffect(() => {
    const prompt = localStorage.getItem("prompt");
    if (!prompt) {
      onError("No prompt found in local storage.");
      return;
    }

    (async () => {
      setChatLog([{ type: "user", content: prompt }]);
      setIsLoading(true);
      onError(null);

      try {
        const { data: skeleton } = await axios.post("/api/skeleton", { prompt: prompt.trim() });
        const { prompts, uiPrompt } = skeleton;
        if (!prompts || !uiPrompt?.[0]) throw new Error("Invalid response from skeleton API.");

        log({ type: "ai", content: "Okay, I'll start with these files:", steps: addSteps(parseXml(uiPrompt[0])) });

        const messages = [...prompts, prompt].map(userMessage);
        const { data } = await axios.post("/api/chat", { messages });
        if (!data.output) throw new Error("Invalid response from detailed steps API.");

        log({ type: "ai", content: "Here are the next steps:", steps: addSteps(parseXml(data.output)) });
        history.current = [...messages, { role: "model", parts: [{ text: data.output }] }];
      } catch (e) {
        fail(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [addSteps, onError, fail]);

  const sendMessage = async (text: string) => {
    setIsLoading(true);
    log({ type: "user", content: text });
    const messages = [...history.current, userMessage(text)];

    try {
      const { data } = await axios.post("/api/chat", { messages });
      history.current = [...messages, { role: "model", parts: [{ text: data.output }] }];
      log({ type: "ai", content: "Here's what I'll do next:", steps: addSteps(parseXml(data.output)) });
    } catch (e) {
      fail(e);
    } finally {
      setIsLoading(false);
    }
  };

  return { chatLog, isLoading, sendMessage };
}
