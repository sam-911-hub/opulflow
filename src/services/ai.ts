import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import useCredits from "@/hooks/useCredits";

export const generateScript = async (
  userId: string,
  prompt: string,
  style: string = "professional"
) => {
  // First deduct credits
  const { deductCredits } = useCredits();
  const success = await deductCredits("ai", 3); // 3 credits per generation
  if (!success) return null;

  try {
    // Call your AI API (OpenAI, Llama, etc.)
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      body: JSON.stringify({ prompt, style, userId })
    });

    if (!response.ok) throw new Error("AI generation failed");

    const result = await response.json();
    return result.text;
  } catch (error) {
    // Refund credits if failed
    await deductCredits("ai", -3);
    throw error;
  }
};