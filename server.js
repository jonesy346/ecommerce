if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({path: '.env'});
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const express = require('express');
const app = express();
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const stripe = require('stripe')(stripeSecretKey);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index.ejs', {
        stripePublicKey: stripePublicKey,
        stripeSecretKey: stripeSecretKey
    });
});

app.get('/products.json', (req, res) => {
    fs.readFile("./products.json", (error, data) => {
        if (error) {
            res.status(500).end();
        } else {
            res.send(data);
        }
    });
});
  
app.post('/purchase', (req, res) => {
    let tempTotal = 0;
    req.body.cart.map(item => {
        tempTotal += item.price * item.amount;
    });

    const total = parseFloat(tempTotal.toFixed(2));
    const corrPrice = total * 100;
    
    stripe.charges.create({
        amount: corrPrice,
        source: req.body.stripeTokenId,
        currency: 'usd'
    }).then(() => {
        console.log('Charge Successful');
        res.json({ message: 'Successfully purchased items' });
    }).catch(() => {
        console.log('Charge Fail');
        res.status(500).end();
    });
});

app.listen(PORT, err => { 
    if (err) console.log("Error in server setup");
    console.log("Server listening on Port", PORT); 
}); 