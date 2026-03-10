import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer"
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", { success: false });
});

app.get("/home", (req, res) => {
  res.render("index.ejs", { success: false });
});

app.get("/about", (req, res) => {
  res.render("index.ejs", { success: false });
});

app.get("/contact", (req, res) => {
  res.render("index.ejs", { success: false });
});

// Graceful fallback for accidental GET requests to /submit
app.get("/submit", (req, res) => {
  res.redirect("/#contact");
});


app.post("/submit", async (req, res) => {
  var name = req.body["name"];
  var mail = req.body["email"];
  var cont = req.body["content"];
  console.log("Submit route hit with:", { name, mail, cont });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: mail,
      to: process.env.EMAIL_USER,
      subject: "Enquiery from your portfolio page",
      text: `You got a new message from ${name} (${mail}):\n\n${cont}`
    };

    const mailOptions2 = {
      from: "smithakp4@gmail.com",  // sender (user’s email from form)
      to: mail, // sending thank you to the user's email
      subject: "Thanks",
      text: `Thank you for visiting my portfolio ${name} `
    };

    // Send emails and wait for them to finish (Required for Vercel)
    console.log("Attempting to send emails...");
    
    try {
      await Promise.all([
        transporter.sendMail(mailOptions),
        transporter.sendMail(mailOptions2)
      ]);
      console.log("✅ Both emails sent successfully");
    } catch (mailError) {
      console.error("❌ Email sending failed:", mailError);
      // We still want to return success if the DB insert worked? 
      // Actually, we don't have a DB anymore. So if email fails, it's a failure.
      throw mailError; 
    }

    // ✅ Return JSON success ONLY after emails are sent
    res.json({ success: true });

  } catch (err) {
    console.error("Error occurred during submission:", err);
    if (!res.headersSent) {
      res.status(500).send("An error occurred while submitting your message.");
    }
  }
});

// Export the app for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log("server is live on port " + port);
  });
}
