const express = require('express')
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const app = express()
const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASSWORD
const is_live = false
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// middleware 
app.use(cors());
app.use(express.json()); 

// mongodb uri connection 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lx750.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// jwt function 
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
    try {
      // await client.connect();
      // database & collections 
      const database = client.db("MarriageCenter");
      const kaziCollection = database.collection("kazi");
      const agentCollection = database.collection("agent");
      const lawyerCollection = database.collection("lawyer");
      const itemCollection = database.collection("item");
      const choicelistCollection = database.collection("choice");
      const bookshopCollection = database.collection("bookshop");
      const categoriesCollection = database.collection("productCategories");
      const usersCollection = database.collection("users");
      const productsCollection = database.collection("products");
      const bookingsCollection = database.collection("bookeditems");
      const postedProductsCollection = database.collection("sellersproducts");
      const  paymentsCollection = database.collection("payments");
    
// -------------All GET API's Start----------------

// GET API for categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });
    // GET API for kazi
    app.get("/kazi", async (req, res) => {
      const query = {};
      const cursor = kaziCollection.find(query);
      const result = await cursor.toArray();
      // const count = await kaziCollection.estimatedDocumentCount();
      res.send(result);
    });

     // GET API for profiles
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query)
      const result = await cursor.toArray();
    
      res.send(result);
    });

     // GET API for agents
    app.get("/agent", async (req, res) => {
      const query = {};
      const result = await agentCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/choice", async (req, res) => {
      const query = {};
      const result = await choicelistCollection.find(query).toArray();
      res.send(result);
    });
     // GET API for lawyers
    app.get("/lawyer", async (req, res) => {
      const query = {};
      const result = await lawyerCollection.find(query).toArray();
      res.send(result);
    });
     // GET API for products
    app.get("/item", async (req, res) => {
      const query = {};
      const result = await itemCollection.find(query).toArray();
      res.send(result);
    });

 
    // GET API to show the Profile id based
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { id: id };
      const cursor = productsCollection.find(query)
      const result = await cursor.toArray();
     
      res.send(result);
    });

    // GET API to show the item id based
    app.get('/item/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const kazi = await itemCollection.findOne(query);
      res.json(kazi);
    })
    // GET API to show the kazi id based
    app.get('/kazi/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const kazi = await kaziCollection.findOne(query);
      res.json(kazi);
    })
    app.get('/lawyer/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const lawyer = await lawyerCollection.findOne(query);
      res.json(lawyer);
    })

    // GET API for productbrand 
    app.get("/productbrandname", async (req, res) => {
      const query = {};
      const result = await categoriesCollection

        .find(query)
        .project({ name: 1 })
        .toArray();
      res.send(result);
    });
    
    // GET API for the posted product by sellers
    app.get("/addedproducts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    // GET API for the booked item on my orders route on client side
    app.get("/bookeditems",  async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    // GET API to show advertised items
    app.get("/advertised", async (req, res) => {
      const query = {};
      const result = await postedProductsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingsCollection.findOne(query);
      res.send(booking);
    });

    // api to get users data
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // admin to see all sellers and all nuyers route
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // api to check sellers to access add a products and my products
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "Seller" });
    });

    // api to check buyers to access my orders on dashboard
    app.get("/users/buyers/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role === "Buyer" });
    });

    // show all sellers users on all sellers route
    app.get("/users/allsellers", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      const allsellers = users.filter((user) => user?.role === "Seller");
      res.send(allsellers);
    });

    // api to show all buyers users on all buyers route
    app.get("/users/allbuyers", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      const allbuyers = users.filter((user) => user?.role === "Buyer");
      res.send(allbuyers);
    });

// -------------All GET API's End----------------

// -------------All POST API's Start----------------

    // POST API for booking items
    app.post("/bookeditems", async (req, res) => {
      const bookingitems = req.body;
      const result = await bookingsCollection.insertOne(bookingitems);
      res.send(result);
    });
    // POST API for sellers posted product
    app.post("/addedproducts", async (req, res) => {
      const postedproduct = req.body;
      const result = await productsCollection.insertOne(postedproduct);
      res.send(result);
    });

    // POST API for kazi 
    app.post("/kazi", async (req, res) => {
      const postedkazi = req.body;
      const result = await kaziCollection.insertOne(postedkazi);
      res.send(result);
    });

    app.post("/bookshop", async (req, res) => {
      // const postedkazi = req.body;
      // const result = await bookshopCollection.insertOne(postedkazi);
      // res.send(result);
      const order = req.body;
      const orderedService = await itemCollection.findOne({_id:ObjectId(order.service)});
      console.log(orderedService);
      const transactionId = new ObjectId().toString();
      const data = {
        total_amount: orderedService.price,
        currency: order.currency,
        tran_id:transactionId,
        success_url: `http://localhost:5000/payment/success?transactionId=${transactionId}`,
              fail_url: `http://localhost:5000/payment/fail?transactionId=${transactionId}`,
              cancel_url: `http://localhost:5000/payment/cancel`,
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: order.customer,
        cus_email: order.email,
        cus_add1: order.address,
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        console.log(apiResponse)
        bookshopCollection.insertOne({
          ...order,
          price:orderedService.price,
          transactionId,
          paid:false,
        });
        res.send({url: GatewayPageURL});
       
    });
})
app.post("/payment/success", async (req, res) => {
  const { transactionId } = req.query;

  const result = await bookshopCollection.updateOne(
    { transactionId },
    { $set: { paid: true, paidAt: new Date() } }
  );

  if(result.modifiedCount > 0){
      res.redirect(`http://localhost:3000/payment/success?transactionId=${transactionId}`);
  }
});

app.get("/orders/by-transaction-id/:id", async (req, res) => {
  const { id } = req.params;
  const order = await bookshopCollection.findOne({ transactionId: id });
  console.log(id, order);
  res.send(order);
});

    app.post("/choice", async (req, res) => {
      const choicelist = req.body;
      const result = await choicelistCollection.insertOne(choicelist);
      res.send(result);
    });
     // POST API for agents

    app.post("/agent", async (req, res) => {
      const postedagent = req.body;
      const result = await agentCollection.insertOne(postedagent);
      res.send(result);
    });
     // POST API for lawyer
    app.post("/lawyer", async (req, res) => {
      const postedlawyer = req.body;
      const result = await lawyerCollection.insertOne(postedlawyer);
      res.send(result);
    });
     // POST API for products
    app.post("/item", async (req, res) => {
      const posteditem = req.body;
      const result = await itemCollection.insertOne(posteditem);
      res.send(result);
    });
    
  
  // api to post advertised items
  app.post("/advertisedproducts", async (req, res) => {
    const advertisedProducts = req.body;
    const advertised = await postedProductsCollection.insertOne(
      advertisedProducts
    );
    res.send(advertised);
  });

  // api to create registered user data in db
  app.post("/users", async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });
  
    // -------------All POST API's end----------------

    // -------------All DELETE API's Start----------------
    // api to delete a seller
    app.delete("/seller/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    // api to delete a buyer
    app.delete("/buyer/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });
    // api to delete product by seller
    app.delete("/postedproduct/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
      res.send(result);
    });
// -------------All DELETE API's end----------------

// -------------All UPDATE API's Start----------------
    // make  a seller verified
    app.put("/seller/verify/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          type: "verified",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
// -------------All UPDATE API's end----------------
 

    // ------------Payment API integrated--------------

    // payment method implementaion
    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const price = booking.resalePrice;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
     // api to store payment info on db
     app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          trandactionId: payment.transactionId,
        },
      };
      const updated = await bookingsCollection.updateOne(filter, updatedDoc);

      res.send(result);
    });
    } 
    finally {   
    }
  }
  run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})