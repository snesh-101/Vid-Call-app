const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use("/peerjs", peerServer);

// Route to render the login page
app.get('/', (req, res) => {
  res.render('login');
});

// Route to handle form submission and redirect to a new room
app.post('/login', (req, res) => {
  const username = req.body.useremail;
  const roomId = uuidv4(); // Generate a new room ID
  res.redirect(`/${roomId}?username=${username}`); // Redirect to the new room with the username
});

// Route to render the room page
app.get('/:room', (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    setTimeout(() => {
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000);

    socket.on("disconnect", () => {
      console.log("User Disconnected");
      io.emit("user-disconnected", userId);
    });
  });
});
const PORT = process.env.PORT || 3030;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});