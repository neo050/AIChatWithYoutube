import express from "express";
import cors from "cors";
import { agent } from "./agent.js";
const port = process.env.PORT||3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/generate", async (req, res) => {
  const { query,video_id,thread_id} = req.body;
  console.log(query,video_id);

    try{
    const result  = await agent.invoke({
    messages: [{role: "user", content: query}],
    
    },{configurable:{thread_id,video_id},recursionLimit:25});
      console.log(result .messages[result.messages.length -1].content);
      res.send(result .messages[result.messages.length -1].content);
    }
    catch(e){
    
    console.log("No relation to the topic");
    console.log(e);
    res.send( e);

    }




});


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
});