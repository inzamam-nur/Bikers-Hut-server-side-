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
    // app.get("/myorders/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const query = { email: email };
    //   const seller = await BookingCollection.find(query).toArray();
    //   res.send(seller);
    // });


    app.get("/myorders/:email", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send("Forbidden Email ");
      }

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }

      const cursor = BookingCollection.find(query);
      const myorders = await cursor.toArray();
      res.send(reviews);

    });

    app.delete("/myproducts/:id([0-9a-fA-F]{24})", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allproductsCOllection.deleteOne(query);
      res.send(result);
    });

    app.get("/allseller", async (req, res) => {
      const email = req.query.email;

      const isAdmin = await allusersCollections.findOne({
        email: req.query.email,
      });
      const sellerType = req.query.type;

      if (sellerType === "seller") {
        const seller = await allusersCollections
          .find({ role: "seller" })
          .toArray();
        res.send(seller);
      }
    });
    app.get("/allbuyer", async (req, res) => {
      const email = req.query.email;

      const isAdmin = await allusersCollections.findOne({
        email: req.query.email,
      });
      const sellerType = req.query.type;
      if (sellerType === "buyer") {
        const buyer = await allusersCollections
          .find({ role: "buyer" })
          .toArray();
        res.send(buyer);
      }
    });
    app.delete("/deleteUser", async (req, res) => {
      const userId = req.body._id;
      const type = req.query.type;
      if (type === "buyer") {
        const buyer = await allusersCollections.deleteOne({
          _id: ObjectId(userId),
        });
        res.send(buyer);
      }
      if (type === "seller") {
        const seller = await allusersCollections.deleteOne({
          _id: ObjectId(userId),
        });
        res.send(seller);
      }
    });
    app.delete("/deleteUser", async (req, res) => {
      const userId = req.body._id;
      const type = req.query.type;
      if (type === "seller") {
        const seller = await allusersCollections.deleteOne({
          _id: ObjectId(userId),
        });
        res.send(seller);
      }
    });

    app.delete("/deleteproduct", async (req, res) => {
      const userId = req.body._id;
      const type = req.query.type;
      const seller = await allusersCollections.deleteOne({
        _id: ObjectId(userId),
      });
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
