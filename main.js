function addTodo(event) {
  event.preventDefault();
  let text = document.getElementById("create-todo");
  db.collection("todo-items").add({
    text: text.value,
    rank: "live",
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
    dosHTML += `
        <div class="todo-text">
            <div class="mark">
                <div data-id="${item.id}" class="marked ${item.rank == "fufilled" ? "checked":""}">
                    <button  class="material-icons" >check</button>
                    <!-- <img src="./assets/check-icon.png" alt=""> -->
                </div>
            </div>
            <div class="text-item ${item.rank == "fufilled" ? "checked":""}">
                ${item.text}
            </div>
    </div>
        `
  })
  

  document.querySelector(".todo-texts").innerHTML= dosHTML; 
  actionListeners();
}


function actionListeners() {
    let doChecker=document.querySelectorAll(".todo-text .marked");
    doChecker.forEach((checker) =>{
        checker.addEventListener("click",function(){
            markDone(checker.dataset.id);
        })
    })
    
}


function markDone(id){
    let todo=db.collection("todo-items").doc(id)

    todo.get().then(function(doc){
        if (doc.exists) {
            let rank=doc.data().rank;
            if(rank == "live"){
                todo.update({
                    rank:"fufilled"
                })
            }else if(rank == "fufilled"){
                todo.update({
                    rank:"live"
                })
            }
        }
    })

    // console.log(id);
}

getTodos();
