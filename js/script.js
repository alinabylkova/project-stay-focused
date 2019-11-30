//Add new list
$('#addNewList').click(function() {
  // read the value of the input
  let listName = $('#newListName').val();
  createTheList(listName);
  $('#newListName').val('');
});

//Add new task
$('#addNewTask').click(function() {
  // read the value of the input
  let taskName = $('#newTodoInput').val();
  // todo replace false by value
  createTheTask(taskName, 'false');
  $('#newTodoInput').val('');
});

// login
// $.ajax({
//   url: 'login',
//   type: 'POST',
//   data: {
//     username: 'Shruti Bhide',
//     password: '456qweasD',
//   },
// }).done(function(object) {
//   console.log('Logged in');
//   sessionStorage.setItem('listId', '');
//   displayList();
// });

displayList();
