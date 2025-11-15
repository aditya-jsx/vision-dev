export const maxDuration = 60;
import { BASE_PROMPT } from "@/app/prompts/defaultPrompt";
import { NODE_PROMPT } from "@/app/prompts/nodePrompt";
import { REACT_PROMPT } from "@/app/prompts/reactPrompt";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({});

export async function POST(req: NextRequest, res: NextResponse){
  const body = await req.json();

  const prompt = body.prompt;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "Return either node ot react based on what you think the project should be.only return the keyword 'react' or 'node'. dont return anything extra",
      candidateCount: 1
    },
  });

  const answer = response.text;

  if (answer == "react"){
    return NextResponse.json({
      prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${REACT_PROMPT}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompt: [REACT_PROMPT]
    })
  }

  if(answer == "node"){
    return NextResponse.json({
      prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${NODE_PROMPT}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompt: [NODE_PROMPT]
    })
  }

  return NextResponse.json({
    msg: "Failed to create a website, Try again"
  })

}
