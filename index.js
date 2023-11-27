const { MongoClient, ServerApiVersion } = require('mongodb');

const express = require('express');
const cors = require('cors');
const app = express()
const jwt = require('jsonwebtoken')
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle ware 
app.use(cors())
app.use(express.json())

const verifyToken = (req, res, next) => {
  if (!req.headers.Authorization) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  const token = req.headers.Authorization.split(' ')[1]
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.decoded = decoded
    next()
  })
}


// mongodb connect 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.fycfdwn.mongodb.net/?retryWrites=true&w=majority`;




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
    // json web token 
    app.post('/jwt', async (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.SECRET, { expiresIn: '1h' })
      res.send({ token })
    })


    app.get('/users', verifyToken, async (req, res) => {
      console.log(req.headers);
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const users = req.body;
      console.log(users);
      const result = await userCollection.insertOne(users);
      res.send(result);
    });

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