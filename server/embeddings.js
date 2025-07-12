import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
 import {pool} from "./db/index.js";
const embeddings = new OpenAIEmbeddings({ 
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-large",
});
export const vectorstore = await PGVectorStore.initialize(embeddings,

  {

   pool:pool,
   tableName:"transcript",
   columns:{
    idColumnName:"id",
    contentColumnName:"content",
    vectorColumnName:"vector",
    metadataColumnName:"metadata"
   },
   distanceStrategy: "cosine",
  }
);


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
    
    
    
    
    await vectorstore.addDocuments(chunks);
}