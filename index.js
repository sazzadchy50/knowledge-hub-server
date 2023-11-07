const express = require("express");
const cors = require("cors");
// const jwt = require('jwt');
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//parser
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsx9xso.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const blogCollection = client.db("knowledge-hub").collection("allBlog");
d
    app.post("/api/v1/add-blog", async (req, res) => {
      const blog = req.body;
      console.log(req.body);
      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

    app.get("/api/v1/allBlog", async (req, res) => {
      let queryObj = {};

      const category = req.query.category;
      const title = req.query.title;
      console.log(req.query);

      if (category) {
        queryObj.category = category;
      }
      if (title) {
        title - new RegExp(title, "i")
        queryObj.title = title;
      }
      const cursor = blogCollection.find(queryObj);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/api/v1/recentBlog", async(req, res)=>{

      const cursor = blogCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("knowledge hub server running");
});

app.listen(port, () => {
  console.log(`knowledge hub server is running in ${port}`);
});
