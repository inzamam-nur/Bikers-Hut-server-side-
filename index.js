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

function verifyJWT(req, res, next) {
  console.log("token", req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized ");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const categorycollection = client.db("Bikershut").collection("Categories");
    const allusersCollections = client.db("Bikershut").collection("Users");
    const allproductsCOllection = client.db("Bikershut").collection("Products");
    const BookingCollection = client.db("Bikershut").collection("booking");

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };

      const user = await allusersCollections.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "forbidden" });
    });
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categorycollection.find(query).toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await allusersCollections.insertOne(user);
      res.send(result);
    });

    app.get("/products/:name", async (req, res) => {
      const name = req.params.name;
      const query = { category: name };
      const result = await allproductsCOllection.find(query).toArray();
      res.send(result);
    });
  

    app.get("/usersTypes/:email", async (req, res) => {
      const email = req.params.email;
      const user = await allusersCollections.findOne({ email });
      const userType = user?.role;
      console.log(userType);
      res.send({ userType });
    });
 
    app.post("/booking", async (req, res) => {
      const bookings = req.body;
      const result = await BookingCollection.insertOne(bookings);
      res.send(result);
    });
    app.post("/products", async (req, res) => {
      const products = req.body;

      const result = await allproductsCOllection.insertOne(products);
      res.send(result);
    });
    app.get("/myproducts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const seller = await allproductsCOllection.find(query).toArray();
      res.send(seller);
    });
    app.get("/allsellers/:role", async (req, res) => {
      const role = req.params.role;
      const query = { role: role };
      const seller = await allusersCollections.find(query).toArray();
      res.send(seller);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Api Running");
});

app.listen(port, () => {
  console.log("running api", port);
});
