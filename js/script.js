if (document.cookie.startsWith('token=') && document.cookie.length > 7) {
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

  $('#userIcon').click(function() {
    $.ajax({
      url: '/logout',
      type: 'GET',
    }).done(function(data) {
      window.location.replace(data);
    });
  });

  displayList();
} else {
  window.location.replace('/login');
}
