import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";
import {createReactAgent} from "@langchain/langgraph/prebuilt";
import data from "./data.js";
import {vectorstores,addYTVtoVectorStores} from "./embeddings.js";
import { tool } from "@langchain/core/tools";   
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

await addYTVtoVectorStores(data[0]); 
await addYTVtoVectorStores(data[1]); 


  const retrieverTool =  tool(async ({query},{configurable:{video_id}})=>{
  console.log("Retrieving docs for query: ----------------------");
  console.log(query);
  console.log(video_id);
  const retrievedDocs = await vectorstores.similaritySearch(query, 3,(doc)=>doc.metadata.video_id===video_id);
  console.log("Retrieved docs: ----------------------");
  console.log(retrievedDocs);

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

const checkpointer= new MemorySaver();

const agent = createReactAgent({
  llm,
  tools: [retrieverTool],
  prompt: "",
  checkpointer
});

const video_id = data[1].video_id;

try{
  const result  = await agent.invoke({
  messages: [{role: "user", content: "How to integrate AI into an existing backend?"}],
  chat_history: [],
},{configurable:{thread_id:1,video_id},recursionLimit:25});
console.log(result .messages[result.messages.length -1].content);
}
catch(e){
  
  console.log("No relation to the topic");
  console.log(e);
}






// invoke it with a list of messages:
// const aiMessage = await llm.invoke([
//   { role: "system",  content: "You’re a friendly translator." },
//   { role: "user",    content: "Translate ‘hello’ to French." },
// ]);
// console.log(aiMessage.content);

 