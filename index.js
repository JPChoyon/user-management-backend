const { MongoClient, ServerApiVersion } = require('mongodb');

const express = require('express');
const cors = require('cors');
const app = express()
// const jwt = require('jsonwebtoken')
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle ware 
app.use(cors())
app.use(express.json())


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