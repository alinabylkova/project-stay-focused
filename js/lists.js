//Display list
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
          <div class="listIcon"><i class="fas fa-list"></i></div>
          <div class="listName">${lists[i].listName}</div>
          <div class="counter"><i class="fas fa-edit editList verticalAlign"></i></div>
          <div class="EditList"><i class="fas fa-trash-alt verticalAlign deleteList"></i></div>
        </div>`;

        $('.listArea').append(generatedHtml);
      }

      applyJqueryToList();
    })
    .fail(function(xhr, message, reason) {
      alert('Error ' + reason);
    });
}

//Create the list
function createTheList(name) {
  $.ajax({
    url: '/lists/',
    type: 'POST',
    data: {
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

//Update the list
function updateTheList(id, text) {
  $.ajax({
    url: '/lists/' + id + '?listName=' + text,
    type: 'PUT',
  })
    .done(function(object) {
      alert('List is updated');
      displayList();
    })
    .fail(function(xhr, message, reason) {
      alert('Error ' + reason);
    });
}

//Delete the list
function deleteTheList(id) {
  $.ajax({
    url: '/lists/' + id,
    type: 'DELETE',
  })
    .done(function(object) {
      alert('List was deleted');
      displayList();
      sessionStorage.setItem('listId', '');
      displayTasks();
    })
    .fail(function(xhr, message, reason) {
      alert('Error ' + reason);
    });
}

function applyJqueryToList() {
  $('.editList').click(function() {
    let workElement = $(this)
      .parents('.listArea_sub')
      .find('.listName');

    if ($('#updateListBtn').length !== 0) {
      alert('Already editing');
      return;
    }

    let text = workElement.text();
    workElement.empty();
    let inputValue = `
    <div id='inputForList' class="input-group mb-3">
      <input value="${text}" type="text" id='inputVal' class="form-control" placeholder="List's name">
      <div class="input-group-append">
        <button id="updateListBtn" class="btn btn-outline-secondary" type="button"><i class="fas fa-save"></i></button>
      </div>
    </div>`;
    workElement.append(inputValue);

    $('#updateListBtn').click(function() {
      let updatedText = workElement.find('input').val();
      let id = workElement.parents('.listArea_sub').attr('listId');
      //put new text in updateTheList and remove input
      updateTheList(id, updatedText);
    });
  });

  $('.deleteList').click(function() {
    let listId = $(this)
      .parents('.listArea_sub')
      .attr('listId');

    deleteTheList(listId);
  });

  $('.listName').click(function() {
    // $(this); - this is chosen element of .listName after click
    let listId = $(this)
      .parents('.listArea_sub')
      .attr('listId');
    sessionStorage.setItem('listId', listId);
    displayTasks();
  });
}

///////////// JQUERY
// inside functions such as .click/toggle/keydown/keypress...(function(){})
// $(this) - is clicked element
