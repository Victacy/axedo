// Declare a variable to store the current filter type
let currentFilter = "all";


function addTodo(event) {
  event.preventDefault();
  let text = document.getElementById("create-todo");
  db.collection("todo-items").add({
    text: text.value,
    rank: "active",
  });
  text.value = "";
}

function getTodos() {
  db.collection("todo-items").onSnapshot((snapshot) => {
    console.log(snapshot);
    let items = [];
    snapshot.docs.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data() //spread operator
      });
    });
    generateTodos(items);
  });
}

function generateTodos(items) {
  let dosHTML = "";
  items.forEach((item) => {
    if (currentFilter === "all" || currentFilter === item.rank) {
       dosHTML += `
        <div class="todo-text" draggable="true" data-id="${item.id}">
            <div class="mark">
                <div data-id="${item.id}" class="marked ${item.rank == "completed" ? "checked":""}">
                    <button  class="material-icons" >check</button>
                    <!-- <img src="./assets/check-icon.png" alt=""> -->
                </div>
            </div>
            <div class="text-item ${item.rank == "completed" ? "checked":""}">
                ${item.text}
            </div>
            <div class="actions">
            <button class="delBtn" onclick="deleteTodo('${item.id}')">Delete</button>
            </div>
            
    </div>
        `
    }
   
  })
  

  document.querySelector(".todo-texts").innerHTML= dosHTML; 
  actionListeners();
}


// function actionListeners() {
//     let doChecker=document.querySelectorAll(".todo-text .marked");
//     doChecker.forEach((checker) =>{
//         checker.addEventListener("click",function(){
//             markDone(checker.dataset.id);
//         })
//     })
    
// }

function actionListeners() {
    let doChecker = document.querySelectorAll(".todo-text .marked");
    doChecker.forEach((checker) => {
      checker.addEventListener("click", function (event) {
        const deleteButton = event.target.closest(".delBtn");
        if (deleteButton) {
          const id = deleteButton.parentNode.dataset.id;
          deleteTodo(id);
        } else {
          markDone(checker.dataset.id);
        }
      });
      checker.addEventListener("dragstart", dragStart);
      checker.addEventListener("dragover", dragOver);
      checker.addEventListener("drop", drop);
    });
    
    // clear todo
    let clearBtn = document.querySelector(".clear-todos span");
    clearBtn.addEventListener("click", function () {
      clearCompletedTodos();
    });

  }


  // Drag start event handler
function dragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.dataset.id);
}

// Drag over event handler
function dragOver(event) {
  event.preventDefault();
}

// Drop event handler
function drop(event) {
  event.preventDefault();
  const droppedItemId = event.dataTransfer.getData("text/plain");
  const targetItemId = event.currentTarget.dataset.id;

  // Swap the ranks of the dropped item and the target item
  swapRanks(droppedItemId, targetItemId);
}



  

// function markDone(id){
//     let todo=db.collection("todo-items").doc(id)

//     todo.get().then(function(doc){
//         if (doc.exists) {
//             let rank=doc.data().rank;
//             if(rank == "live"){
//                 todo.update({
//                     rank:"fufilled"
//                 })
//             }else if(rank == "fufilled"){
//                 todo.update({
//                     rank:"live"
//                 })
//             }
//         }
//     })

//     // console.log(id);
// }

function markDone(id) {
  let todo = db.collection("todo-items").doc(id);

  todo.get().then(function (doc) {
    if (doc.exists) {
      let rank = doc.data().rank;
      if (rank === "active") {
        todo.update({
          rank: "completed",
        });
      } else if (rank === "completed") {
        todo.update({
          rank: "active",
        });
      }
    }
  });
  
  // Call the swapRanks function
  swapRanks(id, null); // passing null as the target ID indicates that it is the last item in the list
}

function swapRanks(droppedItemId, targetItemId) {
  const todosRef = db.collection("todo-items");

  todosRef.doc(droppedItemId).get().then((droppedItemDoc) => {
    const droppedRank = droppedItemDoc.data().rank;
    
    // Update the dropped item's rank to the target item's rank
    todosRef.doc(droppedItemId).update({ rank: targetItemId ? "active" : "completed" });

    // Update the target item's rank to the dropped item's rank
    if (targetItemId) {
      todosRef.doc(targetItemId).update({ rank: droppedRank });
    }
  });
}



// delete todo
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
  
//   delete completed
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
  

  
function filterTodos(filterType) {
  currentFilter = filterType;
  getTodos();
}

getTodos();
