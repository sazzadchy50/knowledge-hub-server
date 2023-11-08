const express = require("express");
const cors = require("cors");
const accessToken = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
const app = express();
const port = process.env.PORT || 5000;
const logger = (req, res, next)=>{
  console.log(req.method, req.url);
  
}
 const verifyToken = (req, res, next)=>{
  const token = req.cookies.token;
  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }
  accessToken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err){
      return res.status(401).send({message: 'unauthorized access'})
    }
    req.user = decoded;
    next()
  })

  
 }



app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//parser
app.use(express.json());
app.use(cookieParser());

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

    //auth related api token access
    app.post('/api/v1/user/access-token', async(req, res)=>{
      const user = req.body;
      console.log('user for token', user);
      const token =  accessToken.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})

      res.cookie('token', token,{
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success: true})
     
    })

    // logout for remove token
    app.post('/api/v1/user/logOut', async(req, res)=>{
      const user = req.body;
      console.log('logging out', user);
      res
      .clearCookie('token', {maxAge: 0})
      .send({success: true})
    })

    app.post("/api/v1/add-blog",  async (req, res) => {
      const blog = req.body;
     
      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

    app.get("/api/v1/allBlog", async (req, res) => {
      // console.log('owner', req.user);
      //  if(req?.user?.email === req.query.email){
      //   return res.status(403).send({message: 'forbidden access'})
      //  }
      let queryObj = {};

      const category = req.query.category;
      const title = req.query.title;
      

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
      const cursor = blogCollection.find().sort({submissionTime: -1});
      const result = await cursor.toArray();
      res.send(result)      
    })

    //details page data
    app.get("/api/v1/allBlog/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await blogCollection.findOne(query)
     
      res.send(result)
    })
    app.patch("/api/v1/allBlog/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
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
