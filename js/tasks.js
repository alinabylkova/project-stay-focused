//Display tasks or Get specific list with all related tasks
function displayTasks() {
  // check weather listId is emptyText or undefined or null or 0
  if (!sessionStorage.getItem('listId')) {
    $('.taskList').empty();
    return;
  }
  $.ajax({
    url: 'lists/' + sessionStorage.getItem('listId'),
    type: 'GET',
  })
    .done(function(data) {
      $('.taskList').empty();

      let tasks = data.tasks;
      for (let i in tasks) {
        let starIconClass = 'far';
        if (tasks[i].important == true) {
          starIconClass = 'fas';
        }

        let html = `
        <div class="taskList_sub" taskId="${tasks[i]._id}"> 
          <div class="starIcon" ><i class="${starIconClass} fa-star importantStar"></i></div>
          <div class="taskItem" >${tasks[i].taskMessage}</div>
          <div class="editButton"><i class="fas fa-edit editTask"></i></div>
          <div class="deleteButton"><i class="fas fa-trash-alt deleteTask"></i></div>
        </div>`;

        $('.taskList').append(html);
      }
      applyJqueryToTasks();
    })
    .fail(function(xhr, status, reason) {
      alert(reason);
    });
}

//Create the task
function createTheTask(message, markedImportant) {
  if (!sessionStorage.getItem('listId')) {
    alert('Please select or create a list');
    return;
  }
  $.ajax({
    url: '/tasks/',
    type: 'POST',
    data: {
      listId: sessionStorage.getItem('listId'),
      taskMessage: message,
      important: markedImportant,
    },
  })
    .done(function(object) {
      alert('Task is created');
      displayTasks();
    })
    .fail(function(xhr, message, reason) {
      alert('Task creation failed ' + reason);
    });
}

//Update the task
function updateTheTask(id, text) {
  $.ajax({
    url: '/tasks/' + id + '?taskMessage=' + text,
    type: 'PUT',
  })
    .done(function(object) {
      alert('Task is updated');
      displayTasks();
    })
    .fail(function(xhr, message, reason) {
      alert('Error ' + reason);
    });
}

//Update the status
function updateTheStatus(id, status) {
  $.ajax({
    url: '/tasks/' + id + '?important=' + status,
    type: 'PUT',
  })
    .done(function(object) {
      alert('Status is updated');
      displayTasks();
    })
    .fail(function(xhr, message, reason) {
      alert('Error ' + reason);
    });
}

//Delete the task
function deleteTheTask(id) {
  $.ajax({
    url: '/tasks/' + id,
    type: 'DELETE',
  })
    .done(function(object) {
      alert('Task was deleted');
      displayTasks();
    })
    .fail(function(xhr, message, reason) {
      alert('Error ' + reason);
    });
}

function applyJqueryToTasks() {
  $('.editTask').click(function() {
    let workElement = $(this)
      .parents('.taskList_sub')
      .find('.taskItem');

    if ($('#updateTaskBtn').length !== 0) {
      alert('Already editing');
      return;
    }

    let text = workElement.text();
    workElement.empty();
    let inputValue = `
    <div class="input-group mb-3">
      <input value="${text}" type="text" class="form-control" placeholder="Task message" aria-label="Task message" aria-describedby="basic-addon2">
      <div class="input-group-append">
        <button id="updateTaskBtn" class="btn btn-outline-secondary" type="button"><i class="fas fa-save"></i></button>
      </div>
    </div>`;
    workElement.append(inputValue);

    $('#updateTaskBtn').click(function() {
      let updatedText = workElement.find('input').val();
      let id = workElement.parents('.taskList_sub').attr('taskId');
      //put new text in updateTheList and remove input
      updateTheTask(id, updatedText);
    });
  });
  ///////////////////////////////////////////////
  $('.starIcon').click(function() {
    let currentElement = $(this);

    let updatedStatus = false;

    if (currentElement.find('i').hasClass('far')) {
      updatedStatus = true;
    } else {
      updatedStatus = false;
    }

    let id = currentElement.parents('.taskList_sub').attr('taskId');
    updateTheStatus(id, updatedStatus);
  });

  $('.deleteTask').click(function() {
    let taskId = $(this)
      .parents('.taskList_sub')
      .attr('taskId');

    deleteTheTask(taskId);
  });
}
