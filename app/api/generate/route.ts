// import { GoogleGenAI } from "@google/genai";
// import { NextRequest, NextResponse } from "next/server";
// import {basePrompt as nodeBasePrompt} from "../../constants/node";
// import {basePrompt as reactBasePrompt} from "../../constants/react";

// import { Gemini_Prompt } from "@/app/lib/utils";

// const ai = new GoogleGenAI({});

// export async function GET(req: NextRequest,res: NextResponse){

//   const body = req.body
//   const prompt = body.prompt;

//   const prompt = req.body;
  
//   const ai = new GoogleGenAI({});
  
//   const response = await ai.models.generateContentStream({
//     model: "gemini-2.5-flash",
//     contents: "How are you",
//   });
  
//   // let output;

//   for await (const chunk of response) {
//     console.log(chunk.text);
//     // output = chunk.text;
//   }
  
//   // return NextResponse.json(output);

// }






// import { Gemini_Prompt } from "@/app/lib/utils";

















import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import {basePrompt as nodeBasePrompt} from "../../constants/node";
import {basePrompt as reactBasePrompt} from "../../constants/react";
import { BASE_PROMPT, getSystemPrompt } from "@/app/prompts/prompts";

const ai = new GoogleGenAI({});


export async function GET(req: NextRequest,res: NextResponse){

  const body = await req.json();
  
  const prompt = body.prompt;

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [
      {
        role: "user",
        parts: [{ text: BASE_PROMPT }],
      },
      {
        role: "user",
        parts: [{ text: getSystemPrompt() }]
      }
    ],
  });

  for await (const chunk of ) {
    console.log(chunk.text);
    console.log("_".repeat(80));
  }

  // const stream1 = await chat.sendMessageStream({
  //   message: "",
  // });

  // for await (const chunk of stream1) {
  //   console.log(chunk.text);
  //   console.log("_".repeat(80));
  // }

  // const stream2 = await chat.sendMessageStream({
  //   message: "",
  // });

  // for await (const chunk of stream2) {
  //   console.log(chunk.text);
  //   console.log("_".repeat(80));
  // }

}
