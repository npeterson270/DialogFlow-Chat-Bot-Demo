const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
const uuid = require('uuid');
let df = require('./dialogFlow');
let dialogFlow = new df.DialogFlow("small-talk-tiksfi");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile('views/index.html' , { root : __dirname});
});
app.get('*', (res, req) => {
  send_failure(res, 404, invalid_resource());
});

io.on('connection', (socket) => {
  socket.on('chat message', (text) => {
    console.log(text);
    socket.sentMessage = false;
    sendQuery(text).then((response) => {
      let sentMessage = false;
      const result = response[0].queryResult;
      console.log("GOT RESPONSE ");
      console.log(result);
      result.refCount = 0;
      socket.emit("bot-response", result);
    }).catch((err) => {
      socket.emit("bot-response", "My name is Ollie, there was a problem.")
      console.log(err);
    })
  });
});

function sendQuery(text) {
  const sessionId = uuid.v4();
  return dialogFlow.sendDialogFlowQuery(text, sessionId);
}

function send_failure(res, server_code, err) {
  let code = (err.code) ? err.code : err.name;
  res.writeHead(server_code, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: code, message: err.message }) + "\n");
}

function invalid_resource() {
  return make_error("invalid_resource", "the requested resource does not exist.");
}

function make_error(err, msg) {
  let e = new Error(msg);
  e.code = err;
  return e;
}

/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/
server.listen(3000);

// module.exports = app;
