const express = require('express');
var cors = require('cors');
const app = express();
const port = 3000;

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://12256421:quangvinh@giftdeliveryapp.m3glq.mongodb.net/?retryWrites=true&w=majority&appName=GiftDeliveryApp";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Global for general use
var userCollection;
var orderCollection;


client.connect(err => {
	userCollection = client.db("giftdelivery").collection("users");
	orderCollection = client.db("giftdelivery").collection("orders");

	// perform actions on the collection object
	console.log('Database up!\n')

});

app.get('/', (req, res) => {
	res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})


app.get('/getUserDataTest', (req, res) => {

	console.log("GET request received\n");

	userCollection.find({}, { projection: { _id: 0 } }).toArray(function (err, docs) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
			console.log(JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>");
		}

	});

});


app.get('/getOrderDataTest', (req, res) => {

	console.log("GET request received\n");

	orderCollection.find({}, { projection: { _id: 0 } }).toArray(function (err, docs) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
			console.log(JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>");
		}

	});

});


app.post('/verifyUser', (req, res) => {
	const loginData = req.body;
	console.log("Login request from " + req.body.email);
    // Check if the email exists in the database
    userCollection.findOne({ email: loginData.email }, { projection: { _id: 0 } }, (err, user) => {
        if (err) {
            console.log("Error verifying user: " + err);
            res.status(500).send("Internal server error");
        } else if (!user) {
            // If email is not found, return an error
            console.log("This email is not registered");
            res.status(400).send("This email didn't register");
        } else if (user.password !== loginData.password) {
            // If the email is found but password is wrong, return an error
            console.log("Email and password do not match");
            res.status(401).send("Email and password do not match");
        } else {
            // If both email and password are correct, redirect to the homepage
            console.log("User authenticated successfully");
            res.status(200).send("Login successful, redirecting to homepage...");
        }
    });
});


app.post('/postOrderData', function (req, res) {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n");

	orderCollection.insertOne(req.body, function (err, result) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
			console.log("Order record with ID " + result.insertedId + " have been inserted\n");
			res.status(200).send(result);
		}

	});

});

// Endpoint to register a new user
app.post('/registerUser', (req, res) => {
    const newUser = req.body;
	console.log("Receive request for registing user" + JSON.stringify(req.body) + "\n");
    // Check if the user already exists based on email
    userCollection.findOne({ email: newUser.email }, (err, user) => {
        if (err) {
            console.log("Error checking user: " + err);
            res.status(500).send("Internal server error");
        } else if (user) {
            // User already exists
            res.status(400).send("This email is already registered.");
        } else {
            // Insert new user into the collection
            userCollection.insertOne(newUser, (err, result) => {
                if (err) {
                    console.log("Error inserting user: " + err);
                    res.status(500).send("Error saving user");
                } else {
                    console.log("User registered with email " + req.body.email);
                    res.status(200).send("Registration successful");
                }
            });
        }
    });
});

// Endpoint to get all orders for a specific user
app.post('/getUserOrders', (req, res) => {
    const userEmail = req.body.email; // email of the logged-in user
	console.log("Receive request information for email " + req.body.email);
    // Retrieve orders for the logged-in user from the orders collection
    orderCollection.find({ customerEmail: userEmail }).toArray((err, orders) => {
        if (err) {
            console.log("Error fetching orders: " + err);
            res.status(500).send("Error fetching orders");
        } else if (orders.length === 0) {
            res.status(404).send("No orders found for this user.");
        } else {
            res.status(200).json(orders);
			console.log("Successful send data of " + req.body.email);
        }
    });
});


// Endpoint to delete selected orders
const { Int32 } = require('mongodb');

app.delete('/deleteSelectedOrders', (req, res) => {
    let orderNumbers = req.body.orderNo;
    console.log("Order numbers to delete: ", orderNumbers);
    orderNumbers = orderNumbers.map(orderNo => Int32(orderNo)); 

    // Delete orders matching orders
    orderCollection.deleteMany({ orderNo: { $in: orderNumbers } }, (err, result) => {
        if (err) {
            console.log("Error deleting orders: " + err);
            res.status(500).send("Error deleting orders");
        } else {
            console.log(result.deletedCount + " orders deleted.");
            res.status(200).send({ deletedCount: result.deletedCount });
        }
    });
});




app.listen(port, () => {
	console.log(`Gift Delivery server app listening at https://giftdeliveryserver-25zw.onrender.com`)
});
