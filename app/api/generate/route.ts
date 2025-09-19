import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest, res: NextResponse){
  const body = await req.json();

  const prompt = body.prompt;

  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "Return either node ot react based on what you think the project should be.only return the keyword 'react' or 'node'. dont return anything extra",
    },
  });

  let output;

  for await (const chunk of response) {
    console.log(chunk.text);
    output = chunk.text;
  }

  const finaloutput = output;

  return NextResponse.json(finaloutput);

}
