require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

// connecting Socket IO with server
const initSocketServer = require("./src/sockets/socket.server");
const { createServer } = require("http");

const httpServer = createServer(app);
connectDB();
initSocketServer(httpServer);

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
