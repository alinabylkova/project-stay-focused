let express = require('express');
let server = express();
server.use(express.urlencoded()); //Parse URL-encoded bodies instead of body-parser
let mongoose = require('mongoose');

//Connect to database
mongoose.connect(
  'mongodb+srv://db-user:ZgITFSQ5UNBkpe9i@stayfocused-v9puq.mongodb.net/test?retryWrites=true&w=majority',
);

//Create a schema for task list
let taskListSchema = new mongoose.Schema({
  taskMessage: String,
  important: Boolean,
});

//Create a model for task list
let TaskList = mongoose.model('TaskList', taskListSchema);

//Create a schema for users
let usersSchema = new mongoose.Schema({
  userLogin: String,
  userPassword: String,
});

//Create a model for users
let Users = mongoose.model('Users', usersSchema);

mockData = [];

server.get('/', function(req, res) {
  res.send(mockData);
});

//crud for taskList

// “/tasks” => “Get all tasks”
server.get('/tasks', function(req, res) {
  // get data from mongodb and pass it to view
  TaskList.find({}, function(err, data) {
    if (err) {
      res.status(404).send('Not found');
      return;
    }
    res.send(data);
  });
});

// “/tasks/:id” => “Get specific task”
server.get('/tasks/:id', function(req, res) {
  let id = req.params.id;
  // get specific data from mongodb and pass it to view
  TaskList.find({ _id: id }, function(err, data) {
    if (err) {
      res.status(404).send('Not found');
      return;
    }
    res.send(data);
  });
});

// “/tasks/:id/?taskMessage=&important=” => “Update tasks”
server.put('/tasks/:id', function(req, res) {
  let id = req.params.id;
  let taskMessage = req.query.taskMessage;
  let important = req.query.important;

  let query = {};

  if (taskMessage !== undefined) {
    query.taskMessage = taskMessage;
  }
  if (important === undefined) {
  } else if (important === 'true') {
    query.important = true;
  } else if (important === 'false') {
    query.important = false;
  } else {
    res.status(400).send('Wrong input, id is not a number');
  }

  console.log(query);
  // find and update the requested item with query object
  TaskList.findOneAndUpdate({ _id: id }, query, function(err, data) {
    if (err) {
      res.status(404).send('Not found');
      return;
    }
    res.send(data);
  });
});

// “/tasks/:id” => “Delete specific task”
server.delete('/tasks/:id', function(req, res) {
  let id = req.params.id;
  // delete the requested item from mongodb
  TaskList.find({ _id: id }).remove(function(err, data) {
    if (err) {
      res.status(404).send('Not found');
      return;
    }
    res.send(data);
  });
});

//Create new task
server.post('/tasks', function(req, res) {
  let newTask = req.body.taskMessage;
  let markedImportant = req.body.important;
  let important = false;
  if (markedImportant == 'true') {
    important = true;
  } else if (markedImportant == 'false') {
    important = false;
  } else {
    res.status(400).send('Wrong input, important is not a boolean');
  }

  if (newTask === undefined || newTask.length === 0) {
    res.status(400).send('Wrong input, task message is undefined');
  }
  // get data from the view and add it to mongodb
  TaskList({ taskMessage: newTask, important: important }).save(function(err, data) {
    if (err) {
      res.status(400).send("Couldn't create the task");
      return;
    }
    res.send(data);
  });
});

//crud for users

// “/users” => “Get all users”
server.get('/users', function(req, res) {
  // get data from mongodb and pass it to view
  Users.find({}, function(err, data) {
    if (err) {
      res.status(404).send('Not found');
      return;
    }
    res.send(data);
  });
});

// “/users/:id” => “Get specific user”
server.get('/users/:id', function(req, res) {
  let id = req.params.id;
  // get specific user from mongodb and pass it to view
  Users.find({ _id: id }, function(err, data) {
    if (err) {
      res.status(404).send('Not found');
      return;
    }
    res.send(data);
  });
});

//Create new user
server.post('/users', function(req, res) {
  let newUser = req.body.userLogin;
  let newPassword = req.body.userPassword; //Validation
  // get data from the view and add it to mongodb
  Users({ userLogin: newUser, userPassword: newPassword }).save(function(err, data) {
    if (err) {
      res.status(400).send("Couldn't create new user");
      return;
    }
    res.send(data);
  });
});

// Tell Express to listen for requests (start server)
server.listen(3000, function() {
  console.log('Server listening on port 3000');
});
