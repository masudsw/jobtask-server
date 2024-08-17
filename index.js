const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173","https://calm-daifuku-5689e9.netlify.app"]
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
    

    
    // Get all products data from db for pagination
    app.get('/products', async (req, res) => {
      const size = parseInt(req.query.size)
      const page = parseInt(req.query.page) - 1
      const filterCategory = req.query.filterCategory
      const filterBrand=req.query.filterBrand
      const filterPrice=req.query.filterPrice
      
      const search = req.query.search
      console.log(size, page)

      let query = {
        product_name: { $regex: search, $options: 'i' },
      }
      if (filterCategory) query.Category = filterCategory
      if(filterBrand) query.brand_name=filterBrand
      if (filterPrice) {
        if (filterPrice === 'hundred') {
            query.Price = { $gte: 0, $lte: 100 };
        } else if (filterPrice === 'five_hundred') {
            query.Price = { $gte: 101, $lte: 500 };
        } else if (filterPrice === 'thousand') {
            query.Price = { $gte: 501, $lte: 1000 };
        } else if(filterPrice==='five_thousand'){
          query.Price = { $gte: 1001, $lte: 5000 };
        }
    }
       let options = {}
     
      const result = await productCollection
        .find(query, options)
        .skip(page * size)
        .limit(size)
        .toArray()

      res.send(result)
    })

    // Get all products data count from db
    app.get('/products-count', async (req, res) => {
      const filterCategory = req.query.filterCategory
      const filterBrand=req.query.filterBrand
      const filterPrice=req.query.filterPrice
      const search = req.query.search
      console.log(filterBrand,filterCategory,filterPrice,search);
      let query = {
        product_name: { $regex: search, $options: 'i' },
      }
      if (filterCategory) query.Category = filterCategory
      if(filterBrand) query.brand_name=filterBrand
      if (filterPrice) {
        if (filterPrice === 'hundred') {
            query.Price = { $gte: 0, $lte: 100 };
        } else if (filterPrice === 'five_hundred') {
            query.Price = { $gte: 101, $lte: 500 };
        } else if (filterPrice === 'thousand') {
            query.Price = { $gte: 501, $lte: 1000 };
        } else if(filterPrice==='five_thousand'){
          query.Price = { $gte: 1001, $lte: 5000 };
        }
    }
      
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

