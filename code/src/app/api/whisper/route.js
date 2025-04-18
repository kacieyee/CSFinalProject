export const runtime = "nodejs";

import { NextResponse } from "next/server";
import axios from "axios";
import FormDataNode from "form-data";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio");

    if (!audioBlob || typeof audioBlob.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No audio file given" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioBlob.arrayBuffer());

    const openaiForm = new FormDataNode();
    openaiForm.append("file", buffer, {
      filename: "audio.ogg",
      contentType: audioBlob.type || "audio/ogg",
    });
    openaiForm.append("model", "whisper-1");

    const apiKey = process.env.OPENAI_API_KEY;

    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", openaiForm, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...openaiForm.getHeaders(),
      },
    });

    return NextResponse.json({ text: response.data.text });
  } catch (error) {
    console.error("Whisper API error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
  }
}
