import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";
import {createReactAgent} from "@langchain/langgraph/prebuilt";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import data from "./data.js";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { tool } from "@langchain/core/tools";   
import { z } from "zod";


const docs=[new Document({pageContent:data[0].transcript,metadata:{video_id:data[0].video_id}}),new Document({pageContent:data[1].transcript,metadata:{video_id:data[1].video_id}})];
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const chunks = await splitter.splitDocuments(docs);

//console.log(chunks);


const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-large",
});

const vectorstores = new MemoryVectorStore(embeddings);

await vectorstores.addDocuments(chunks);

const retrievedDocs = await vectorstores.similaritySearch
("What are the most complicated and amazing things that can be done with fireworks today thanks to the science of fireworks?", 
  5);

// console.log(retrievedDocs);

const retrieverTool =  tool(async ({query})=>{
  console.log("Retrieving docs for query: ----------------------");
  console.log(query);
  const retrievedDocs = await vectorstores.similaritySearch(query, 3);

  const serializedDocs = retrievedDocs.map((doc) => doc.pageContent).join("\n ");
  return serializedDocs;

},
{
  name: "retriever",
  description: "Retrieves the most relevant chunks of text from the transcript of a yotube video",
  schema: z.object({
    query: z.string(),
  }),

})

const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
  apiKey:process.env.OPENAI_API_KEY, // `OPENAI_API_KEY` is the default value, you can omit this p
});

const agent = createReactAgent({
  llm,
  tools: [retrieverTool],
  prompt: "",
});

const result  = await agent.invoke({
  messages: [{role: "user", content: "What are the most complicated and amazing things that can be done with fireworks today thanks to the science of fireworks?"}],
  chat_history: [],
});
console.log(result .messages[result.messages.length -1].content);

// invoke it with a list of messages:
// const aiMessage = await llm.invoke([
//   { role: "system",  content: "You’re a friendly translator." },
//   { role: "user",    content: "Translate ‘hello’ to French." },
// ]);
// console.log(aiMessage.content);

 