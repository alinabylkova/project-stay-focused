let mockId = '5dded523bf94394994e63c41';

$.ajax({
  url: 'lists/' + mockId,
  type: 'GET',
})
  .done(function(tasks) {
    for (let i in tasks) {
      let html = `<div class="taskList_sub" taskId="${tasks[i]._id}"> 
      <div class="starIcon" ${tasks[i].important}></div>
      <div class="taskItem" ${tasks[i].taskMessage}></div>
      <div class="deleteButton"></div>
    </div>`;

      // var html =
      //   '<div class="listArea_sub" id="' +
      //   tasks[i]._id +
      //   '">' +
      //   '<div class="listIcon">b</div>' +
      //   '<div class="listName">' +
      //   tasks[i].taskMessage +
      //   '</div>' +
      //   '<div class="counter">' +
      //   tasks[i].important +
      //   '</div>' +
      //   '<div class="EditList">b</div>' +
      //   '</div>';

      $('.taskList').append(html);
    }
  })
  .fail(function(xhr, message, reason) {
    alert(reason);
  });

function deleteTheList(id) {
  $.ajax({
    url: '/lists/' + id,
    type: 'DELETE',
  })
    .done(function(object) {
      displayList();
      alert('List was deleted');
    })
    .fail(function(xhr, message, reason) {
      alert('Error ' + reason);
    });
}

function displayList() {
  $.ajax({
    url: '/lists',
    type: 'GET',
  })
    .done(function(lists) {
      $('.listArea').empty();

      for (let i in lists) {
        // todo improve counter ${lists[i].tasks.length}
        let generatedHtml = `
        <div class="listArea_sub" listId="${lists[i]._id}">
          <div class="listIcon">b</div>
          <div class="listName">${lists[i].listName}</div>
          <div class="counter">${lists[i].tasks.length}</div>
          <div class="EditList"><i class="fas fa-edit editList"></i><i class="fas fa-trash-alt deleteList"></i></div>
        </div>`;

        $('.listArea').append(generatedHtml);
      }

      applyJqueryToList();
    })
    .fail(function(xhr, message, reason) {
      alert(reason);
    });
}

function createTheList(name) {
  $.ajax({
    url: '/lists/',
    type: 'POST',
    data: {
      userId: mockId,
      listName: name,
    },
  })
    .done(function(object) {
      alert('List is created');
      displayList();
    })
    .fail(function(xhr, message, reason) {
      alert('List creation failed ' + reason);
    });
}

$('#addNewList').click(function() {
  // read the value of the input
  let listName = $('#newListName').val();
  createTheList(listName);
  $('#newListName').val('');
  displayList();
});

function applyJqueryToList() {
  $('.editList').click(function() {});

  $('.deleteList').click(function() {
    let listId = $(this)
      .parent()
      .parent()
      .attr('listId');

    deleteTheList(listId);
  });
}

$.ajax({
  url: 'login',
  type: 'POST',
  data: {
    username: 'Shruti Bhide',
    password: '456qweasD',
  },
}).done(function(object) {
  console.log('Logged in');
  displayList();
});
