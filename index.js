const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173"]
}))

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tatfmly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

client.connect()
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });



async function run() {
  try {

    const exploreHubDB = client.db('jobtask');
    const productCollection = exploreHubDB.collection('products');
    

    
    // Get all jobs data from db for pagination
    app.get('/products', async (req, res) => {
      const size = parseInt(req.query.size)
      const page = parseInt(req.query.page) - 1
      const filter = req.query.filter
      const sort = req.query.sort
      const search = req.query.search
      console.log(size, page)

      let query = {
        job_title: { $regex: search, $options: 'i' },
      }
      if (filter) query.category = filter
      let options = {}
      if (sort) options = { sort: { deadline: sort === 'asc' ? 1 : -1 } }
      const result = await productCollection
        .find(query, options)
        .skip(page * size)
        .limit(size)
        .toArray()

      res.send(result)
    })

    // Get all jobs data count from db
    app.get('/products-count', async (req, res) => {
      const filter = req.query.filter
      const search = req.query.search
      let query = {
        product_name: { $regex: search, $options: 'i' },
      }
      if (filter) query.category = filter
      const count = await productCollection.countDocuments(query)
      console.log('total products',count);
      res.send({ count })
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('jobTask server is running')
})

app.listen(port, () => {
  console.log(`jobTask is running on port: ${port}`)
})

