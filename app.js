let express = require('express');
let mongoose = require('mongoose');
let passwordValidator = require('password-validator');

let server = express();
server.use(express.urlencoded()); //Parse URL-encoded bodies instead of body-parser

const Schema = mongoose.Schema;

//Connect to database
mongoose.connect(
  'mongodb+srv://db-user:ZgITFSQ5UNBkpe9i@stayfocused-v9puq.mongodb.net/test?retryWrites=true&w=majority',
);

let pwdValidator = new passwordValidator();

pwdValidator
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(20) // Maximum length 20
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits() // Must have digits
  .has()
  .not()
  .spaces(); // Should not have spaces

//Create a schema for task list
let taskListSchema = new mongoose.Schema({
  // we don't specify _id because it's set to ObjectId by default
  // _id: { type: Schema.Types.ObjectId },
  taskMessage: { type: String, required: true },
  important: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
});

//Create a schema for users
let usersSchema = new mongoose.Schema({
  userLogin: { type: String, unique: true, required: true },
  userPassword: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'tasks' }],
});

//Create a model for task list
let TaskList = mongoose.model('tasks', taskListSchema);

//Create a model for users
let Users = mongoose.model('users', usersSchema);

// function to check if string is blank (string of spaces is blank)
function isBlank(str) {
  return !str || /^\s*$/.test(str);
}

server.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.get('/css/style.css', function(req, res) {
  res.sendFile(__dirname + '/css/style.css');
});

server.get('/js/script.js', function(req, res) {
  res.sendFile(__dirname + '/js/script.js');
});

//crud for taskList

// “/user/:userId/tasks => “Get all tasks of specific user”
server.get('/users/:userId/tasks', function(req, res) {
  let userId = req.params.userId;
  // get data from mongodb and pass it to view
  TaskList.find({ userId: userId }, function(err, data) {
    if (err) {
      console.log(err);
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
      console.log(err);
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
    if (isBlank(taskMessage)) {
      res.status(400).send('Wrong input, taskMessage should not be blank');
      return;
    } else {
      query.taskMessage = taskMessage;
    }
  }

  if (important !== undefined) {
    if (important === 'true') {
      query.important = true;
    } else if (important === 'false') {
      query.important = false;
    } else {
      res.status(400).send('Wrong input, important is not a boolean');
      return;
    }
  }

  // find and update the requested item with query object
  TaskList.findOneAndUpdate({ _id: id }, query, function(err, data) {
    if (err) {
      console.log(err);
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
      console.log(err);
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

  let userId = req.body.userId;

  let important = false;
  if (markedImportant == 'true') {
    important = true;
  } else if (markedImportant == 'false') {
    important = false;
  } else {
    res.status(400).send('Wrong input, important is not a boolean');
    return;
  }

  if (newTask === undefined || isBlank(newTask)) {
    res.status(400).send('Wrong input, task message is undefined');
    return;
  }

  Users.find({ _id: userId }, function(err, foundUser) {
    if (err) {
      console.log(err);
      res.status(404).send('User not found');
      return;
    }

    let user = foundUser[0];

    // get data from the view and add it to mongodb
    TaskList({ taskMessage: newTask, important: important, userId: user._id }).save(function(
      err,
      createdTask,
    ) {
      if (err) {
        console.log(err);
        res.status(400).send("Couldn't create the task");
        return;
      }

      user.tasks.push(createdTask);
      user.save();

      res.send(createdTask);
    });
  });
});

//crud for users

// “/users” => “Get all users”
server.get('/users', function(req, res) {
  // get data from mongodb and pass it to view
  Users.find({}, function(err, data) {
    if (err) {
      console.log(err);
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
  Users.find({ _id: id })
    .populate('tasks')
    .exec(function(err, data) {
      if (err) {
        console.log(err);
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

  if (newUser === undefined || isBlank(newUser)) {
    res.status(400).send('Wrong input, username is undefined');
    return;
  }

  // Validate against a password string
  console.log(pwdValidator.validate(newPassword));
  // => true

  if (newPassword === undefined || isBlank(newPassword)) {
    res.status(400).send('Wrong input, password is undefined');
    return;
  }

  if (pwdValidator.validate(newPassword) === false) {
    res.status(400).send('Weak password');
    return;
  }

  // get data from the view and add it to mongodb
  Users({ userLogin: newUser, userPassword: newPassword }).save(function(err, data) {
    if (err) {
      console.log(err);
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
