const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId, } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cors());
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 5000;

require("dotenv").config()


// mongodb connect 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.fycfdwn.mongodb.net/?retryWrites=true&w=majority`;


const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  const token = req.headers.authorization.split(' ')[1]
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.decoded = decoded
    next()
  })
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.db("admin").command({ ping: 1 });
    const userCollection = client.db("userManagement").collection("users");
    const riviewColllection = client.db("userManagement").collection("reviews");

    // jwt authinacation
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET, {
        expiresIn: "100d",
      });
      res.send(token);
    });

    app.get('/user/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email
      if (!email === req.decoded.email) {
        return res.status(403).send({ message: 'unauthorized user' })
      }
      const query = { email: email }
      const user = await userCollection.findOne(query)
      let admin = false;
      if (user) {
        admin = user.selectedRole === 'admin'
      }
      res.send({ admin })
    })


    app.get('/user/employee/:email', verifyToken, async (req, res) => {
      const email = req.params.email
      if (!email === req.decoded.email) {
        return res.status(403).send({ message: 'unauthorized user' })
      }
      const query = { email: email }
      const user = await userCollection.findOne(query)
      let employee = false;
      if (user) {
        employee = user?.selectedRole === 'employee'
      }
      res.send({ employee })
    })
    app.get('/user/hr/:email', verifyToken, async (req, res) => {
      const email = req.params.email
      if (!email === req.decoded.email) {
        return res.status(403).send({ message: 'unauthorized user' })
      }
      const query = { email: email }
      const user = await userCollection.findOne(query)
      let hr = false;
      if (user) {
        hr = user?.selectedRole === 'hr'
      }
      res.send({ hr })
    })


    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })

    // manage user role 
    app.patch('/users/hr/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          selectedRole: 'hr'
        }
      }
      const result = await userCollection.updateOne(query, updateDoc)
      res.send(result)
    })

    app.post('/logout', async (req, res) => {
      const user = req.body;
      res.clearCookie('token', { maxAge: 0 }).send({ success: true })
    })

    app.get('/users',verifyToken, async (req, res) => {     
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const users = req.body;
      
      const result = await userCollection.insertOne(users);
      res.send(result);
    });

    // revew 
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await riviewColllection.insertOne(review);
      res.send(result)
    })
    app.get('/reviews', async (req, res) => {
      const cursor = riviewColllection
        .find();
      const result = await cursor.toArray()

      res.send(result)
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);


// server runnig
app.get('/', (req, res) => {
  res.send('user mangement is on')
})
app.listen(port, () => {
  console.log('server runnig at port', port);
})