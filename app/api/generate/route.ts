import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";


export async function GET(res: NextResponse){

    const ai = new GoogleGenAI({});
    
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: "Write a code for the Todo Application in HTML",
    });

    let output;

    for await (const chunk of response) {
      // console.log(chunk.text);
      output = chunk.text
    }


    return NextResponse.json({
        output
    });
}

// The client gets the API key from the environment variable `GEMINI_API_KEY`.