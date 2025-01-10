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
        tasks = json.data.tasks;
        refreshTaskList();
    });
});

// sorting buttons click events
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

// a function to refresh the entire task list
const refreshTaskList = (sort) => {
    // sort if asc or desc given
    if (sort === 'asc') {
        tasks.sort((task1, task2) => task1.subtasksCount - task2.subtasksCount);
    } else if (sort === 'desc') {
        tasks.sort((task1, task2) => task2.subtasksCount - task1.subtasksCount);
    }

    // clear and repopulate task list
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

        // manage subtask addition form
        let subtaskForm = taskTemplate.querySelector('form.subtask-form');
        let subtaskErrorsNode = taskTemplate.querySelector('.errors');
        let subtasksCountElement = taskTemplate.querySelector('.subtask-count');
        let subtasksList = taskTemplate.querySelector('.subtasks-list');
        subtaskForm.addEventListener('submit', (evt) => {
            evt.preventDefault();

            // get subtask text
            const subtask = subtaskForm.querySelector('input[name="subtask-label"]').value;

            // error management
            subtaskErrorsNode.innerHTML = '';
            if (!subtask.length || subtask.length > 255) {
                subtaskErrorsNode.innerHTML += '<div><strong>L\'intitulé</strong> est vide ou trop long (1-255 caractères)</div>';
                return;
            }

            // save subtask into global tasks object in accurate task[i]
            tasks[i].subtasks.push(subtask);

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
                tasks = json.data.tasks;

                // clear form
                subtaskForm.reset();

                // refresh subtask list after subtask was added
                refreshSubtaskList(i, subtasksList, subtasksCountElement);
            });
        });

        // refresh subtask list when adding the task to the task list
        refreshSubtaskList(i, subtasksList, subtasksCountElement);

        // actually display task
        tasksDiv.appendChild(taskTemplate);

        // only clean task label in task form, keep createdBy and assignee
        taskFormLabel.value = '';
    }
};

// a function to refresh subtask list for a single task
const refreshSubtaskList = (i, subtasksList, subtasksCountElement) => {
    // display count
    subtasksCountElement.innerText = tasks[i].subtasks.length;

    // clear and rewrite subtasks
    subtasksList.innerHTML = '';
    for (let subtask of tasks[i].subtasks) {
        let subtaskTemplate = document.importNode(subtaskTemplateElement.content, true);
        let subtaskTemplateLabel = subtaskTemplate.querySelector('span.subtask-value-label');
        subtaskTemplateLabel.innerText = subtask;

        // handle subtask remove icon
        let removeIcon = subtaskTemplate.querySelector('.subtask-remove-icon');
        removeIcon.addEventListener('click', (e) => {
            tasks[i].subtasks.splice(tasks[i].subtasks.indexOf(subtask), 1);
            e.target.parentElement.remove();

            // send to api
            fetch('/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    data: {
                        tasks: tasks
                    },
                }),
            })
            .then((response) => response.json())
            .then((json) => {
                if (json.errors) {
                    errorsNode.innerHTML += '<div>' + json.errors + '</div>';
                    return;
                }
                tasks = json.data.tasks;

                // refresh subtask list after subtask was added
                subtasksCountElement.innerText = tasks[i].subtasksCount;
            });
        });

        subtasksList.appendChild(subtaskTemplate);
    }
};