import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "@/app/prompts/defaultPrompt";
const ai = new GoogleGenAI({});

export async function POST(req:NextRequest, res:NextResponse){
  
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

    let output:any;
    
    for await (const chunks of response){
      // console.log(chunks.text)
      output = output + chunks.text;
    }

    return NextResponse.json({output});
    
  }catch(e){
    console.log("Failed to get the response from the model")
  }

}
