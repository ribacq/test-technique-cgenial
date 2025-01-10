<?php

namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Task class
 */
class Task
{
    // we use Assert\Length to validate Task fields
    #[Assert\Length(min: 1, max: 255, minMessage: 'intitulé ne peut être vide', maxMessage: 'intitulé ne peut dépasser 255 caractères')]
    private string $label;

    #[Assert\Length(min: 1, max: 255, minMessage: 'créateur.ice ne peut être vide', maxMessage: 'créateur.ice ne peut dépasser 255 caractères')]
    private string $createdBy;

    #[Assert\Length(min: 1, max: 255, minMessage: 'assignation ne peut être vide', maxMessage: 'assignation ne peut dépasser 255 caractères')]
    private string $assignee;

    private string $createdAt;

    private array $subtasks;

    public function __construct(string $label, string $createdBy, string $assignee, string $createdAt, array $subtasks = [])
    {
        $this->label = $label;
        $this->createdBy = $createdBy;
        $this->assignee = $assignee;
        $this->createdAt = $createdAt;
        $this->subtasks = $subtasks;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function getCreatedBy(): string
    {
        return $this->createdBy;
    }

    public function getAssignee(): string
    {
        return $this->assignee;
    }

    public function getCreatedAt(): string
    {
        return $this->createdAt;
    }

    public function getSubtasks(): array
    {
        return $this->subtasks;
    }

    // subtasks are counted in Task instead of TasksOrganizer since this is a very simple operation
    public function getSubtasksCount(): int
    {
        return count($this->subtasks);
    }
}