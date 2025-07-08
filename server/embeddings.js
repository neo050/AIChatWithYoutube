import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

const embeddings = new OpenAIEmbeddings({ 
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-large",
});

export const vectorstores = new MemoryVectorStore(embeddings);

export const addYTVtoVectorStores = async (videoData)=>
{
    const {transcript,video_id}=videoData
    const docs=[new Document({pageContent:transcript,
        metadata:{video_id}
        })
    ];
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const chunks = await splitter.splitDocuments(docs);
    
    //console.log(chunks);
    
    
    
    
    await vectorstores.addDocuments(chunks);
}