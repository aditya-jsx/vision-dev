import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "@/app/prompts/defaultPrompt";
const ai = new GoogleGenAI({});

export async function POST(req:NextRequest, res:NextResponse){

    const body = await req.json();
    const messages = body.messages;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages,
        config: {
          systemInstruction: systemPrompt(),
        },
    });

    console.log(response.text);

    return NextResponse.json({});

}