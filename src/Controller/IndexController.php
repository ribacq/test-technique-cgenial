<?php

namespace App\Controller;

use App\Entity\Task;
use App\Service\TasksOrganizer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class IndexController extends AbstractController
{
    // render client page
    #[Route('/', name: 'app_index')]
    public function index(): Response
    {
        return $this->render('index/index.html.twig');
    }

    // POST /tasks receives tasks as json, returns them again with an added field subtasksCount
    #[Route('/tasks', name: 'app_index_create_task', methods: 'POST')]
    public function createTask(Request $request, ValidatorInterface $validator): JsonResponse
    {
        // check for empty or malformed json
        $payload = json_decode($request->getContent(), true);
        if (empty($payload)) {
            return $this->json([
                'errors' => 'json transmis vide ou invalide',
            ], Response::HTTP_BAD_REQUEST);
        }
        if (empty($payload['data']['tasks'])) {
            return $this->json([
                'errors' => 'aucune tâche transmises',
            ], Response::HTTP_BAD_REQUEST);
        }

        // validate payload as an array of Task objects
        $tasksOrganizer = new TasksOrganizer();
        foreach ($payload['data']['tasks'] as $jsonTask) {
            $task = new Task($jsonTask['label'] ?? '', $jsonTask['createdBy'] ?: '', $jsonTask['assignee'] ?? '', $jsonTask['createdAt'] ?? '');
            $errors = $validator->validate($task);

            if (count($errors) > 0) {
                return $this->json([
                    'errors' => (string) $errors,
                    'payload' => $jsonTask,
                ], Response::HTTP_BAD_REQUEST);
            }

            $tasksOrganizer->addTask($task);
        }

        // if valid, return organized (sorted and counted) tasks
        return $this->json([
            'data' => [
                'tasks' => $tasksOrganizer->getOrganizedTasks(),
            ],
        ], Response::HTTP_OK);
    }
}
