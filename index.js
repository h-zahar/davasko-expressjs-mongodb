const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ObjectId } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gmeoo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const run = async() => {
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        const offerings = database.collection(process.env.DB_COLLECTION_OFFERING);
        const orders = database.collection(process.env.DB_COLLECTION_ORDER);

        app.get('/offerings', async (req, res) => {
            const cursor = offerings.find({});
        
            const dataReturn = async() => {
                return cursor.toArray();
            };
            
            const results = await dataReturn();
            res.json(results);
        });

        app.get('/offerings/:id', async (req, res) => {
            const {id} = req.params;
            const query = { _id: ObjectId(id) };

            const result = await offerings.findOne(query);
            res.json(result);
        });

        app.post('/offerings', async (req, res) => {
            const doc = req.body;
            const result = await offerings.insertOne(doc);
            console.log(result);
            res.json(result);
        });

        app.delete('/orders/:id', async (req, res) => {
            const { id } = req.params;
            query = { _id: ObjectId(id) };
            const result = await orders.deleteOne(query);

            if (result.deletedCount === 1) {
                res.json(result);
                console.log(result);
            }
        });

        app.put('/orders', async (req, res) => {
            const updated = req.body;

            const filter = { _id: ObjectId(updated._id) };
               
               let updateDoc = {};
               if(updated.isAproved)
               {
                updated.isAproved = false;
                updateDoc = {
                    $set: {
                        isAproved: false
                    },
                };
               }

               else {
                updated.isAproved = true;
                updateDoc = {
                    $set: {
                        isAproved: true
                    },
                };
               }

            const result = await orders.updateOne(filter, updateDoc);
            res.json(updated);
            console.log(updated);

        });

        app.get('/orders/:id', async (req, res) => {
                const { id } = req.params;
                const query = { _id: ObjectId(id) };

                const result = await orders.findOne(query);
                if(result) {
                    res.json(result);
                }

                else {
                    res.json({});
                }
                
            })

        app.get('/orders', async (req, res) => {
            const cursor = orders.find({});
        
            const dataReturn = async() => {
                return cursor.toArray();
            };
            
            const results = await dataReturn();


            if (results.length > 0) {
                res.json(results);
            }
            else {
                res.json([]);
            }
        });

        app.post('/orders', async (req, res) => {
            const doc = req.body;
            const key = 'isAproved';
            doc[key] = false;
            const result = await orders.insertOne(doc);
            res.json(result);
        });

    } finally {
        // await client.close();
    }
};
run().catch(console.dir);


app.get('/', (req, res) => {
    req.send('Server Running Happily...');
});

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});