const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwzs0mx.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const toysCollection = client.db('tingTong').collection('toys')

        // add data to database

        //   get all the data from database
        app.get("/allToys", async (req, res) => {
            const result = await toysCollection.find({}).limit(20).toArray();
            res.send(result);
          });
          

        // get single toys
        app.get("/details/:id", async (req, res) => {
            console.log(req.params.id);
            const toys = await toysCollection.findOne({ _id: new ObjectId(req.params.id) });
            res.send(toys);
        });

        // add data to database
        app.post("/addToys", async (req, res) => {
            const body = req.body;
            console.log(body);
            const result = await toysCollection.insertOne(body);
            if (result?.insertedId) {
                return res.status(200).send(result);
            } else {
                return res.status(404).send({
                    message: "body not found",
                    status: false,
                });
            }
        });

        // get category wise data
        app.get("/allToys/:category", async (req, res) => {
            //console.log(req.params.id);
            const toys = await toysCollection.find({ category: req.params.category, }).toArray();
            res.send(toys);
        });

        // my toys 

        app.get("/myToys/:email", async (req, res) => {
            const { email } = req.params;
            const { sort } = req.query;
          
            let sortOption = {};
            if (sort === "asc") {
              sortOption = { price: 1 };
            } else if (sort === "desc") {
              sortOption = { price: -1 };
            }
          
            try {
              const toys = await toysCollection
                .find({ sellerEmail: email })
                .sort(sortOption)
                .toArray();
          
              res.send(toys);
            } catch (error) {
              console.error("Error fetching toys:", error);
              res.status(500).send("An error occurred while fetching toys.");
            }
          });
          

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ting Tong Server is running')
})

app.listen(port, () => {
    console.log(`Ting Tong DisneyLandS Server is running on port ${port}`)
})