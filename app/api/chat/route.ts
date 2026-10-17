export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "@/app/prompts/defaultPrompt";
const ai = new GoogleGenAI({});

export async function POST(req:NextRequest){
  
  try{

    const body = await req.json();
    const messages = body.messages;

    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: messages,
        config: {
          systemInstruction: systemPrompt(),
        },
    });

    let output:string = "";
    
    for await (const chunks of response){
      output = output + chunks.text;
    }

    return NextResponse.json({output});
    
  }catch(e){
    console.error("Failed to get the response from the model", e);
    return NextResponse.json(
      { error: "Failed to get response from model" },
      { status: 500 }
    );
  }

}
