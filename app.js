let express = require('express');
let mongoose = require('mongoose');
let passwordValidator = require('password-validator');
let cookieParser = require('cookie-parser');

let server = express();

server.use(cookieParser());
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

//Create a schema for tasks
let taskSchema = new Schema({
  // we don't specify _id because it's set to ObjectId by default
  // _id: { type: Schema.Types.ObjectId },
  taskMessage: { type: String, required: true },
  important: { type: Boolean, default: false },
  listId: { type: Schema.Types.ObjectId, ref: 'lists', required: true },
});

//Create a schema for lists
let listSchema = new Schema({
  listName: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'tasks' }],
});

//Create a schema for users
let usersSchema = new Schema({
  userLogin: { type: String, unique: true, required: true },
  userPassword: { type: String, required: true },
  lists: [{ type: Schema.Types.ObjectId, ref: 'lists' }],
});

//Create a model for tasks
let Tasks = mongoose.model('tasks', taskSchema);

//Create a model for lists
let List = mongoose.model('lists', listSchema);

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

// login
server.post('/login', function(req, res) {
  let name = req.body.username;
  let pwd = req.body.password;

  Users.findOne({ userLogin: name, userPassword: pwd }, function(err, foundUser) {
    if (err) {
      console.log(err);
      res.status(404).send('Not found');
    }
    if (!foundUser) {
      res.status(404).send('Not found');
    }

    res.cookie('token', foundUser._id).send();
  });
});

// “/tasks/:id” => “Get specific task”
server.get('/tasks/:id', function(req, res) {
  let id = req.params.id;
  // get specific data from mongodb and pass it to view
  Tasks.findById(id, function(err, data) {
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
  Tasks.updateOne({ _id: id }, query, function(err, data) {
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
  Tasks.findByIdAndDelete(id, function(err) {
    if (err) {
      console.log(err);
      res.status(404).send('Not found');
      return;
    }
    res.send('Removed');
  });
});

//Create new task
server.post('/tasks', function(req, res) {
  let newTask = req.body.taskMessage;
  let markedImportant = req.body.important;

  let listId = req.body.listId;

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

  if (listId === undefined || isBlank(listId)) {
    res.status(400).send('Wrong input, listId is undefined');
    return;
  }

  List.findById(listId, function(err, foundList) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal error');
      return;
    }
    if (foundList.length === 0) {
      res.status(404).send('List is not found');
      return;
    }

    // get data from the view and add it to mongodb
    Tasks({
      taskMessage: newTask,
      important: important,
      listId: foundList._id,
    }).save(function(err, createdTask) {
      if (err) {
        console.log(err);
        res.status(400).send("Couldn't create the task");
        return;
      }

      foundList.tasks.push(createdTask);

      foundList.save();

      res.send(createdTask);
    });
  });
});

//crud for lists

// “/lists” => “Get all lists” //Remove this section
// server.get('/lists', function(req, res) {
//   // get data from mongodb and pass it to view
//   List.find({}, function(err, data) {
//     if (err) {
//       console.log(err);
//       res.status(404).send('Not found');
//       return;
//     }
//     res.send(data);
//   });
// });

server.get('/lists', function(req, res) {
  let userId = req.cookies.token;
  console.log(userId);
  // get data from mongodb and pass it to view
  List.find({ userId: userId }, function(err, data) {
    if (err) {
      res.status(404).send('Not found');
      return;
    }
    res.send(data);
  });
});

// “/lists/:id” => “Get specific list with all related tasks”
server.get('/lists/:id', function(req, res) {
  let id = req.params.id;
  // get specific list from mongodb and pass it to view
  List.findById(id)
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

// “/lists/:id/?listName=” => “Update list”
server.put('/lists/:id', function(req, res) {
  let id = req.params.id;
  let listName = req.query.listName;
  // let counter = req.query.counter; //Write a code later

  if (listName === undefined || isBlank(listName)) {
    res.status(400).send('Wrong input, listName should not be blank');
  }

  // find and update the requested list with query object
  List.findOneAndUpdate({ _id: id }, { listName: listName }, function(err, data) {
    if (err) {
      console.log(err);
      res.status(404).send('Not found');
      return;
    }
    res.send(data);
  });
});

// “/lists/:id” => “Delete specific list”
server.delete('/lists/:id', function(req, res) {
  let id = req.params.id;
  // delete the requested list from mongodb
  Tasks.deleteMany({ listId: id }, function(err) {
    if (err) {
      console.log(err);
      res.status(404).send('Not found');
      return;
    }
    List.findByIdAndDelete(id, function(err) {
      if (err) {
        console.log(err);
        res.status(404).send('Not found');
        return;
      }
      res.send('Deleted');
    });
  });
});

//Create new list
server.post('/lists', function(req, res) {
  let newList = req.body.listName;
  // let numberOfTasks = req.body.counter;

  let userId = req.body.userId;

  if (newList === undefined || isBlank(newList)) {
    res.status(400).send('Wrong input, list name is undefined');
    return;
  }

  Users.findById(userId, function(err, foundUser) {
    if (err) {
      console.log(err);
      res.status(404).send('User not found');
      return;
    }

    // get data from the view and add it to mongodb
    List({ listName: newList, userId: foundUser._id }).save(function(
      //Add to the object {counter: numberOfTasks} later
      err,
      createdList,
    ) {
      if (err) {
        console.log(err);
        res.status(400).send("Couldn't create the list");
        return;
      }

      foundUser.lists.push(createdList);
      foundUser.save();

      res.send(createdList);
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
  Users.findById(id)
    .populate('tasks', 'lists')
    .exec(function(err, data) {
      if (err) {
        console.log(err);
        res.status(404).send('Not found');
        return;
      }

      res.send(data);
    });
});

// “/users/:userId/lists => “Get all lists of specific user”
// server.get('/users/:userId/lists', function(req, res) {
//   let userId = req.params.userId;
//   // get data from mongodb and pass it to view
//   List.find({ userId: userId }, function(err, data) {
//     if (err) {
//       console.log(err);
//       res.status(404).send('Not found');
//       return;
//     }
//     res.send(data);
//   });
// });

//Create new user
server.post('/users', function(req, res) {
  let newUser = req.body.userLogin;
  let newPassword = req.body.userPassword;

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
