const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.Port || 5000;
const cors = require("cors");
require("dotenv").config();
const { mongoose, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nnocokg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const categorycollection = client.db("Bikershut").collection("Categories");
    const usersCollections = client.db("Bikershut").collection("Users");
    app.get("/categories", async (req, res) => {
      const query = {};
      const cursor = categorycollection.find(query);
      const result = await cursor.toArray();
      res.send(result);


      app.post("/users", async (req, res) => {
        const user = req.body;
        // console.log(user);
        const result = await usersCollections.insertOne(user);
        res.send(result);
      });
    });
  } 
  finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Api Running");
});

app.listen(port, () => {
  console.log("running api", port);
});
