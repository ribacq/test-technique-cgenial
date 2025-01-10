// get the forms
let taskForm = document.querySelector('form#task-form');
let errorsNode = taskForm.querySelector('.errors');

// get the task form fields
let taskFormLabel = taskForm.querySelector('input[name="label"]');
let taskFormCreatedBy = taskForm.querySelector('input[name="created-by"]');
let taskFormAssignee = taskForm.querySelector('input[name="assignee"]');

// tasks div
let tasksDiv = document.querySelector('div#tasks');

// get the templates and their fields
let taskTemplateElement = document.querySelector('template#task-template');
let subtaskTemplateElement = document.querySelector('template#subtask-template');

// tasks client storage
let tasks = [];

// set event on submit
taskForm.addEventListener('submit', (e) => {
    // prevent page from reloading
    e.preventDefault();

    // construct task object
    let task = {
        label: taskFormLabel.value,
        createdBy: taskFormCreatedBy.value,
        assignee: taskFormAssignee.value,
        createdAt: Date.now(),
        subtasks: [],
    };

    // client-side validation
    errorsNode.innerHTML = '';
    if (!task.label.length || task.label.length > 255) {
        errorsNode.innerHTML += '<div><strong>L\'intitulé</strong> est vide ou trop long (1-255 caractères)</div>';
        return;
    }
    if (!task.createdBy.length || task.createdBy.length > 255) {
        errorsNode.innerHTML += '<div><strong>Le créateur·ice</strong> est vide ou trop long (1-255 caractères)</div>';
        return;
    }
    if (!task.assignee.length || task.assignee.length > 255) {
        errorsNode.innerHTML += '<div><strong>L\'assignation</strong> est vide ou trop long (1-255 caractères)</div>';
        return;
    }

    for (existingTask of tasks) {
        if (existingTask.label === task.label) {
            errorsNode.innerHTML += '<div><strong>L\'intitulé</strong> existe déjà</div>';
            return;
        }
    }

    tasks.push(task);

    // send to api
    fetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
            data: {
                tasks: tasks
            }
        }),
    })
    .then((response) => response.json())
    .then((json) => {
        if (json.errors) {
            errorsNode.innerHTML += '<div>' + json.errors + '</div>';
            return;
        }
        refreshTaskList(json.data.tasks);
    });
});

document.querySelector('#task-sort-asc').addEventListener('click', () => refreshTaskList('asc'));
document.querySelector('#task-sort-desc').addEventListener('click', () => refreshTaskList('desc'));

// constants
const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
});

const refreshTaskList = (sort) => {
    if (sort === 'asc') {
        tasks.sort((task1, task2) => task1.subtasks.length - task2.subtasks.length);
    } else if (sort === 'desc') {
        tasks.sort((task1, task2) => task2.subtasks.length - task1.subtasks.length);
    }

    tasksDiv.innerHTML = '';
    for (let i in tasks) {
        let task = tasks[i];

        // add to list using template
        let taskTemplate = document.importNode(taskTemplateElement.content, true);
        let taskTemplateLabel = taskTemplate.querySelector('span.task-value-label');
        let taskTemplateCreatedBy = taskTemplate.querySelector('span.task-value-created-by');
        let taskTemplateAssignee = taskTemplate.querySelector('span.task-value-assignee');
        let taskTemplateCreatedAt = taskTemplate.querySelector('span.task-value-created-at');

        taskTemplateLabel.innerText = task.label;
        taskTemplateCreatedBy.innerText = task.createdBy;
        taskTemplateAssignee.innerText = task.assignee;
        taskTemplateCreatedAt.innerText = dateTimeFormat.format(task.createdAt);

        let subtaskForm = taskTemplate.querySelector('form.subtask-form');
        let subtaskErrorsNode = taskTemplate.querySelector('.errors');
        let subtaskCountElement = taskTemplate.querySelector('.subtask-count');
        let subtasksList = taskTemplate.querySelector('.subtasks-list');
        subtaskForm.addEventListener('submit', (evt) => {
            evt.preventDefault();

            const subtask = subtaskForm.querySelector('input[name="subtask-label"]').value;

            subtaskErrorsNode.innerHTML = '';
            if (!subtask.length || subtask.length > 255) {
                subtaskErrorsNode.innerHTML += '<div><strong>L\'intitulé</strong> est vide ou trop long (1-255 caractères)</div>';
                return;
            }

            tasks[i].subtasks.push(subtask);
            subtaskForm.reset();

            refreshSubtaskList(task, subtasksList, subtaskCountElement);
        });

        refreshSubtaskList(task, subtasksList, subtaskCountElement);

        tasksDiv.appendChild(taskTemplate);
        taskFormLabel.value = '';
    }
};

const refreshSubtaskList = (task, subtasksList, subtaskCountElement) => {
    subtaskCountElement.innerText = task.subtasks.length;

    subtasksList.innerHTML = '';
    for (let subtask of task.subtasks) {
        let subtaskTemplate = document.importNode(subtaskTemplateElement.content, true);
        let subtaskTemplateLabel = subtaskTemplate.querySelector('span.subtask-value-label');
        subtaskTemplateLabel.innerText = subtask;

        let removeIcon = subtaskTemplate.querySelector('.subtask-remove-icon');
        removeIcon.addEventListener('click', (e) => {
            task.subtasks.splice(task.subtasks.indexOf(subtask), 1);
            e.target.parentElement.remove();
            subtaskCountElement.innerText = task.subtasks.length;
        });

        subtasksList.appendChild(subtaskTemplate);
    }
};