const taskTitleInput = document.querySelector("#task-title");
const taskPrioritySelect = document.querySelector("#task-priority");
const addTaskButton = document.querySelector("#add-task-btn");
const taskList = document.querySelector("#task-list");
let tasks = [];
const searchInput = document.querySelector("#search-input");
const filterPrioritySelect = document.querySelector("#filter-priority");
let priorities = ["High", "Medium", "Low"];
const taskCategorySelect = document.querySelector("#task-category");
const customisePriorityButton = document.querySelector("#customise-priority-btn");
const priorityEditor = document.querySelector("#priority-editor");
const newPriorityInput = document.querySelector("#new-priority");
const addPriorityButton = document.querySelector("#add-priority-btn");

function renderTasks(filters = {}) {
  const { search = "", priority = "" } = filters;

  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priority ? task.priority === priority : true;
    return matchesSearch && matchesPriority;
  });

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No tasks match your criteria.";
    taskList.appendChild(emptyMessage);
    return;
  }

  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement("li");
    taskItem.textContent = `${task.title} - ${task.priority} - ${task.category} - Due: ${
      task.dueDate || "No due date"
    }`;
    taskItem.draggable = true;

    taskItem.addEventListener("dragstart", () => {
      taskItem.classList.add("dragging");
      taskItem.setAttribute("data-index", index);
    });

    taskItem.addEventListener("dragend", () => {
      taskItem.classList.remove("dragging");
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => {
      deleteTask(index);
    };

    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    if (isOverdue) {
      taskItem.classList.add("overdue");
    }
  });

  enableDragAndDrop();
}

function deleteTask(index) {
  tasks.splice(index, 1);

  saveTasksToLocalStorage();

  renderTasks();
}

addTaskButton.addEventListener("click", () => {
  const taskTitle = taskTitleInput.value;
  const taskPriority = taskPrioritySelect.value;
  const taskDueDate = document.querySelector("#task-due-date").value;
  const taskCategory = taskCategorySelect.value;

  if (taskTitle.trim() === "") {
    alert("Task title cannot be empty");
    return;
  }

  tasks.push({
    title: taskTitle,
    priority: taskPriority,
    dueDate: taskDueDate,
    category: taskCategory,
  });

  saveTasksToLocalStorage();

  renderTasks();

  taskTitleInput.value = "";
  taskDueDate.value = "";
});

function saveTasksToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    try {
      tasks = JSON.parse(savedTasks);
      renderTasks();
    } catch (error) {
      console.error("Failed to parse tasks from local storage", error);
      tasks = [];
    }
  }
}

searchInput.addEventListener("input", () => {
  const search = searchInput.value;
  const priority = filterPrioritySelect.value;
  renderTasks({ search, priority });
});

filterPrioritySelect.addEventListener("change", () => {
  const search = searchInput.value;
  const priority = filterPrioritySelect.value;
  renderTasks({ search, priority });
});

function enableDragAndDrop() {
  taskList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingTask = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement == null) {
      taskList.appendChild(draggingTask);
    } else {
      taskList.insertBefore(draggingTask, afterElement);
    }
  });

  taskList.addEventListener("drop", () => {
    const draggingTask = document.querySelector(".dragging");
    const oldIndex = parseInt(draggingTask.getAttribute("data-index"));
    const newIndex = Array.from(taskList.children).indexOf(draggingTask);

    const [movedTask] = tasks.splice(oldIndex, 1);
    tasks.splice(newIndex, 0, movedTask);

    saveTasksToLocalStorage();
    renderTasks();
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function updatePriorityDropdown() {
  taskPrioritySelect.innerHTML = priorities
    .map((priority) => `<option value="${priority}">${priority}</option>`)
    .join("");
}

updatePriorityDropdown();

customisePriorityButton.addEventListener("click", () => {
  priorityEditor.style.display = priorityEditor.style.display === "none" ? "block" : "none";
});

addPriorityButton.addEventListener("click", () => {
  const newPriority = newPriorityInput.value.trim();
  if (newPriority && !priorities.includes(newPriority)) {
    priorities.push(newPriority);

    taskPrioritySelect.innerHTML = priorities
      .map((priority) => `<option value="${priority}">${priority}</option>`)
      .join("");

    alert(`Priority "${newPriority}" added successfully!`);
    newPriorityInput.value = "";
  } else {
    alert("Invalid or duplicate priority!");
  }
});

function checkOverDueTasks() {
  const overdueTasks = tasks.filter((task) => {
    return task.dueDate && new Date(task.dueDate) < new Date();
  });

  if (overdueTasks.length > 0) {
    alert(`You have ${overdueTasks.length} overdue tasks!`);
  }
}

setInterval(checkOverDueTasks, 60000);
loadTasksFromLocalStorage();
checkOverDueTasks();
