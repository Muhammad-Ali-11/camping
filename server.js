const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json());

// Firebase Initialization
var serviceAccount = require("./path/to/your-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-database-url.firebaseio.com"
});

let db = admin.firestore();

// Nodemailer setup
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Contact form submission
app.post('/submit-form', (req, res) => {
    const { name, email, message } = req.body;

    // Send email
    let mailOptions = {
        from: email,
        to: 'your-email@gmail.com',
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            return res.status(500).send(error.toString());
        }

        // Save to Firebase
        db.collection('contacts').add({
            name: name,
            email: email,
            message: message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            return res.status(200).send('Form submitted successfully!');
        }).catch((error) => {
            return res.status(500).send(error.toString());
        });
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
