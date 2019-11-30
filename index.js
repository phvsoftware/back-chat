require("dotenv").config();

const cors = require("cors");
const formidableMiddleware = require("express-formidable");
const WebSocket = require("ws");
const cloudinary = require("cloudinary").v2;
const express = require("express");
const http = require("http");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(formidableMiddleware());
app.use(cors());

app.post("/upload", async (req, res) => {
  console.log("route upload");
  // upload de l'image
  try {
    cloudinary.uploader.upload(req.files.picture.path, async function(
      error,
      result
    ) {
      if (!error) {
        console.log("upload ok");
        const url = result.secure_url;
        // message de retour
        res.json({ picture: url });
      } else {
        console.log("upload échec");
        res.status(400).json({ message: "An error occurred" });
      }
    });
  } catch (e) {
    console.log("catch", e);
    res.status(400).json({ message: "An error occurred" });
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });

wss.on("connection", connection => {
  console.log("nouvelle connection");

  connection.on("message", message => {
    console.log("nouveau message", message);
    // Transmettre un message à tous les autres utilisateurs connectés (broadcast)
    wss.clients.forEach(client => {
      if (client !== connection && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.log("Server started on port ", process.env.PORT || 8080);
});
