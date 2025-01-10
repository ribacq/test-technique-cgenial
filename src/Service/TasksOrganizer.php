<?php

namespace App\Service;

use App\Entity\Task;

/**
 * TasksOrganizer is a simple service converting an array of Task objects to a PHP array with added field subtasksCount for each task
 */
class TasksOrganizer
{
    private array $tasks = [];

    public function addTask(Task $task)
    {
        $this->tasks[] = $task;
    }

    public function getOrganizedTasks()
    {
        $tasksArray = [];
        foreach ($this->tasks as $task) {
            $tasksArray[] = [
                'label' => $task->getLabel(),
                'createdBy' => $task->getCreatedBy(),
                'assignee' => $task->getAssignee(),
                'createdAt' => $task->getCreatedAt(),
                'subtasks' => $task->getSubtasks(),
                'subtasksCount' => $task->getSubtasksCount(),
            ];
        }

        return $tasksArray;
    }
}