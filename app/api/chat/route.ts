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
      console.log(chunks.text)
      output = output + chunks.text;
    }

    return NextResponse.json({output});

  }catch(e){
    console.log("Failed to get the response from the model")
  }

}



































// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { systemPrompt } from "@/app/prompts/defaultPrompt";
// // import { iteratorToStream } from "@/lib/stream-utils"; // 👈 Import the new utility

// const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const messages = body.messages;

//     if (!messages || messages.length === 0) {
//       return NextResponse.json({ error: "Messages are required" }, { status: 400 });
//     }

//     const model = ai.getGenerativeModel({
//       model: "gemini-2.5-flash",
//       systemInstruction: systemPrompt(),
//     });

//     const response = await model.generateContentStream({
//       contents: messages,
//     });

//     // 💡 THE FIX: Convert the async iterator to a ReadableStream
//     const stream = iteratorToStream(response.stream);

//     return new Response(stream, {
//       headers: {
//         "Content-Type": "text/plain; charset=utf-8",
//         "Connection": "keep-alive",
//         "Cache-Control": "no-cache, no-transform",
//       },
//     });

//   } catch (e) {
//     console.error("--- ERROR IN API ROUTE ---", e);
//     return NextResponse.json(
//       { error: "An internal server error occurred." },
//       { status: 500 }
//     );
//   }
// }



// // This utility function converts an Async Generator/Iterator
// // into a ReadableStream.
// export function iteratorToStream(iterator: AsyncGenerator<any, any, undefined>) {
//   return new ReadableStream({
//     async pull(controller) {
//       const { value, done } = await iterator.next();

//       if (done) {
//         controller.close();
//       } else {
//         // The value from the Gemini SDK is an object, we need to get the text part
//         // And we must encode it to a Uint8Array for the stream
//         const text = value?.text() || '';
//         controller.enqueue(new TextEncoder().encode(text));
//       }
//     },
//   });
// }