let express = require('express');
let server = express();
server.use(express.urlencoded()); //Parse URL-encoded bodies instead of body-parser

let mockData = [
  {
    id: 1,
    taskMessage: 'Todo1',
    important: true,
  },
  {
    id: 2,
    taskMessage: 'Todo2',
    important: false,
  },
  {
    id: 3,
    taskMessage: 'Todo3',
    important: true,
  },
  {
    id: 4,
    taskMessage: 'Todo4',
    important: true,
  },
];

function findTaskById(id) {
  // этот for идет по индексу. Если в массиве был удален элемент, то по данному индексу будет undefined
  // for (let i = 0; i < mockData.length; i++) ...
  // лучше использовать этот for, который получает индексы всего массива без удаленных
  // for (let i in mockData) ...

  // проблема этого дейвствия в том что он бежит по всем элементам
  // допустим задали элемент null, если он не был найден в for то он и останится null
  // var foundElement = null;
  // for (let i in mockData) {
  // если элемент был найден, то foundElement обновится, но цикл дальше будет испольняться даже если мы уверены что остальные элементы не
  // равны искомому id, то нет смысла продолжать выполнение цикла, так как мы тратим процессор в пустую
  //   if (id === mockData[i].id) {
  //     foundElement = mockData[i];
  //   }
  // }
  // return foundElement;

  for (let i in mockData) {
    if (id === mockData[i].id) {
      // в данном случае как только элемен найден, мы завершаем функцию, выходим из нее ворачивая искомый элемент, в данном случае цикл
      // приостанавливается
      return mockData[i];
    }
  }

  // если мы пробежали через весь массив, и элемент не был найден, и прерывющая цикл функция return mockData[i]; не выполнилась, значит
  // нам нужно вернуть null
  return null;
}

function deleteTaskById(id) {
  for (let i in mockData) {
    if (id === mockData[i].id) {
      console.log(i, 1);
      mockData.splice(i, 1);
      return true;
    }
  }

  return false;
}

function updateTaskById(id, text, important) {
  for (let i in mockData) {
    if (id === mockData[i].id) {
      if (text !== null) {
        mockData[i].taskMessage = text;
      }
      if (important !== null) {
        mockData[i].important = important;
      }

      return mockData[i];
    }
  }
  return null;
}

function createNewTask(taskMessage, important) {
  let maxId = 0;
  for (let i in mockData) {
    if (mockData[i].id > maxId) {
      maxId = mockData[i].id;
    }
  }
  maxId++;
  let newTask = {
    id: maxId,
    taskMessage: taskMessage,
    important: important,
  };

  mockData.push(newTask);
  return newTask;
}

server.get('/', function(req, res) {
  res.send(mockData);
});

// “/tasks” => “Get all tasks”
server.get('/tasks', function(req, res) {
  res.send(mockData);
});

// “/tasks/:id” => “Get specific task”
server.get('/tasks/:id', function(req, res) {
  // parseInt we convert string number into integer number = '2' -> 2
  // if `req.param.id` = text, then `let id = Nan`
  let id = parseInt(req.params.id);
  if (isNaN(id)) {
    // send error that id is not a number
    res.status(400).send('Wrong input, id is not a number');
    return;
  }
  let result = findTaskById(id);
  if (result === null) {
    res.status(404).send();
    return;
  }
  res.send(result);
});

// “/tasks/:id/?taskMessage=&important=” => “Update tasks”
server.put('/tasks/:id', function(req, res) {
  let id = parseInt(req.params.id);
  let taskMessage = req.query.taskMessage;
  let important = req.query.important;
  if (isNaN(id)) {
    res.status(400).send('Wrong input, id is not a number');
    return;
  }
  if (taskMessage === undefined) {
    taskMessage = null;
  }
  if (important === undefined) {
    important = null;
  } else if (important === 'true') {
    important = true;
  } else if (important === 'false') {
    important = false;
  } else {
    res.status(400).send('Wrong input, id is not a number');
  }

  let result = updateTaskById(id, taskMessage, important);
  if (result === null) {
    res.status(404).send();
    return;
  }
  console.log(mockData);
  res.send(result);
});

// “/tasks/:id” => “Delete specific task”
server.delete('/tasks/:id', function(req, res) {
  let id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).send('Wrong input, id is not a number');
    return;
  }
  let result = deleteTaskById(id);
  res.send(result);
});

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
  let result = createNewTask(newTask, important);
  res.send(result);
});

// Tell Express to listen for requests (start server)
server.listen(3000, function() {
  console.log('Server listening on port 3000');
});
