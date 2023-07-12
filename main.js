function toggleMode() {
  const body = document.querySelector("body");
  const modeButton = document.querySelector(".mode img");
  const themeStyle = document.getElementById("theme-style");

  body.classList.toggle("light-mode");

  if (body.classList.contains("light-mode")) {
    modeButton.src = "assets/icon-moon.svg";
    themeStyle.href = "light-mode.css";
  } else {
    modeButton.src = "assets/icon-sun.svg";
    themeStyle.href = "style.css";
  }
}


function addTodo(event) {
  event.preventDefault();
  let text = document.getElementById("create-todo");
  db.collection("todo-items").add({
    text: text.value,
    rank: "active",
  });
  text.value = "";
}

function getTodos(filterType) {
  db.collection("todo-items").onSnapshot((snapshot) => {
    let items = [];
    snapshot.docs.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data() //spread operator
      });
    });
    generateTodos(items,filterType);
  });
}

function generateTodos(items,filterType) {
  let todosHTML = "";
  let remainingTodos=0;
  items.forEach((item) => {
    if (item.rank !== "completed") {
      remainingTodos++;
    }

    if (
      (filterType === "active" && item.rank === "active") ||
      (filterType === "completed" && item.rank === "completed") ||
      filterType === "all"
    ){
      todosHTML += `
      <div class="todo-text" draggable="true" data-id="${item.id}">
          <div class="mark">
              <div data-id="${item.id}" class="marked ${item.rank == "completed" ? "checked":""}">
                  <img src="./assets/icon-check.svg" alt="">
              </div>
          </div>
          <div class="text-item ${item.rank == "completed" ? "checked":""}">
              ${item.text}
          </div>
          <div class="actions"> 
              <img src="./assets/icon-delete.svg" alt="" class="delBtn" onclick="deleteTodo('${item.id}')" >
          </div>
      </div>
  `;  
    }
  });


  document.querySelector(".todo-texts").innerHTML = todosHTML;
  document.querySelector(".remaining-todos").textContent = `${remainingTodos} todos left`; // Update the remaining todos count
  dragListeners();
  actionListeners();
}

function dragListeners() {
  const todoTexts = document.querySelectorAll('.todo-text');
  todoTexts.forEach((todoText) => {
    todoText.addEventListener('dragstart', dragStart);
    todoText.addEventListener('dragover', dragOver);
    todoText.addEventListener('dragenter', dragEnter);
    todoText.addEventListener('dragleave', dragLeave);
    todoText.addEventListener('drop', drop);
    todoText.addEventListener('dragend', dragEnd);
  });
}


let draggedItem;

function dragStart(event) {
  draggedItem = this;
  setTimeout(() => {
    this.style.display = 'none';
  }, 0);
}

function dragOver(event) {
  event.preventDefault();
}

function dragEnter(event) {
  event.preventDefault();
  this.style.borderTop = '2px solid #55DDFF';
}

function dragLeave() {
  this.style.borderTop = 'none';
}

function drop(event) {
  event.preventDefault();
  const targetItem = this;
  const targetIndex = getIndex(targetItem);
  const draggedIndex = getIndex(draggedItem);

  if (targetItem === draggedItem) {
    return;
  }

  const todoItems = Array.from(document.querySelectorAll('.todo-text'));
  const targetItemDataId = targetItem.dataset.id;
  const draggedItemDataId = draggedItem.dataset.id;
  const targetTodoItem = todoItems.find((item) => item.dataset.id === targetItemDataId);
  const draggedTodoItem = todoItems.find((item) => item.dataset.id === draggedItemDataId);

  if (targetIndex < draggedIndex) {
    targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
    todoItems.splice(draggedIndex, 1);
    todoItems.splice(targetIndex + 1, 0, draggedTodoItem);
  } else {
    targetItem.parentNode.insertBefore(draggedItem, targetItem);
    todoItems.splice(draggedIndex, 1);
    todoItems.splice(targetIndex, 0, draggedTodoItem);
  }

  const reorderedItems = todoItems.map((item, index) => ({
    id: item.dataset.id,
    rank: 'active',
    order: index + 1,
  }));

  todoItems.forEach((item, index) => {
    const itemId = item.dataset.id;
    db.collection('todo-items').doc(itemId).update({
      order: index + 1,
    });
  });

  targetItem.style.borderTop = 'none';
}


function dragEnd() {
  this.style.display = 'flex';
}

function actionListeners() {
  let doChecker = document.querySelectorAll('.todo-text .marked');
  doChecker.forEach((checker) => {
    checker.addEventListener('click', function (event) {
      const deleteButton = event.target.closest('.delBtn');
      if (deleteButton) {
        const id = deleteButton.parentNode.dataset.id;
        deleteTodo(id);
      } else {
        toggleTodoStatus(checker.dataset.id);
      }
    });
  });

  let clearBtn = document.querySelector('.clear-todos span');
  clearBtn.addEventListener('click', function () {
    clearCompletedTodos();
  });
}


function toggleTodoStatus(id, currentRank) {
  const todo = db.collection("todo-items").doc(id);
  const newRank = currentRank === "completed" ? "active" : "completed";
  
  todo.update({
    rank: newRank,
  })
  .then(function() {
    swapRanks(id, null);
  })
  .catch(function(error) {
    console.error("Error updating todo status: ", error);
  });
}

function swapRanks(droppedItemId, targetItemId) {
  const todosRef = db.collection("todo-items");

  todosRef.doc(droppedItemId).get().then((droppedItemDoc) => {
    const droppedRank = droppedItemDoc.data().rank;
    
    todosRef.doc(droppedItemId).update({ rank: targetItemId ? "active" : "completed" });

    if (targetItemId) {
      todosRef.doc(targetItemId).update({ rank: droppedRank });
    }
  });
}



function swapRanks(droppedItemId, targetItemId) {
  const todosRef = db.collection("todo-items");

  todosRef.doc(droppedItemId).get().then((droppedItemDoc) => {
    const droppedRank = droppedItemDoc.data().rank;
    
    todosRef.doc(droppedItemId).update({ rank: targetItemId ? "active" : "completed" });

    if (targetItemId) {
      todosRef.doc(targetItemId).update({ rank: droppedRank });
    }
  });
}

function deleteTodo(id) {
  db.collection("todo-items")
    .doc(id)
    .delete()
    .then(function () {
      console.log("Todo deleted successfully!");
    })
    .catch(function (error) {
      console.error("Error deleting todo: ", error);
    });
}


function clearCompletedTodos() {
  db.collection("todo-items")
    .where("rank", "==", "completed")
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        doc.ref.delete();
      });
    })
    .catch(function (error) {
      console.error("Error removing completed todos: ", error);
    });
}


function getIndex(element) {
  let index = 0;
  while ((element = element.previousElementSibling)) {
    index++;
  }
  return index;
}

function filterTodos(filterType) {
  currentFilter = filterType;
  getTodos(filterType);
}




getTodos("all");