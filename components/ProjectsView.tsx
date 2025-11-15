
import React, { useMemo } from 'react';
import { Task, Project, Category } from '../types';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { ProgressRing } from './ProgressRing';

interface ProjectsViewProps {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  onUpdateTask: (task: Task) => void;
  onSetFocusTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onPostponeTask: (taskId: string) => void;
}

const ProjectCard: React.FC<Omit<ProjectsViewProps, 'projects'> & { project: Project }> = 
({ tasks, project, categories, onUpdateTask, onSetFocusTask, onEditTask, onViewTask, onPostponeTask }) => {

    const { projectTasks, completedCount, progress } = useMemo(() => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        const completedCount = projectTasks.filter(t => t.isDone).length;
        const progress = projectTasks.length > 0 ? (completedCount / projectTasks.length) * 100 : 0;
        return { projectTasks, completedCount, progress };
    }, [tasks, project.id]);

    const activeTasks = projectTasks.filter(t => !t.isDone);
    const completedTasks = projectTasks.filter(t => t.isDone);

    const handleTaskClick = (task: Task) => {
        if (task.isDone) {
            onViewTask(task);
        } else {
            onEditTask(task);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                        <i className={`fa-solid ${project.icon || 'fa-folder-open'}`} style={{color: project.color}}></i>
                        <span>{project.name}</span>
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {completedCount} из {projectTasks.length} задач выполнено
                    </p>
                </div>
                <ProgressRing progress={progress} radius={35} stroke={5} />
            </div>

            <div className="space-y-3">
                {activeTasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        project={project}
                        category={categories.find(c => c.id === task.categoryId)}
                        onUpdate={onUpdateTask}
                        onSetFocus={onSetFocusTask}
                        onEdit={handleTaskClick}
                        onPostponeTask={onPostponeTask}
                    />
                ))}
                {activeTasks.length === 0 && (
                    <EmptyState 
                        illustration={completedTasks.length > 0 ? 'all-done' : 'no-tasks'} 
                        message={completedTasks.length > 0 ? "Все задачи в этом проекте выполнены!" : "Добавьте задачи в этот проект."} 
                    />
                )}

                {completedTasks.length > 0 && activeTasks.length > 0 && (
                     <div className="text-center my-4">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-700/50 px-3 py-1 rounded-full">Выполненные</span>
                    </div>
                )}

                {completedTasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        project={project}
                        category={categories.find(c => c.id === task.categoryId)}
                        onUpdate={onUpdateTask}
                        onSetFocus={onSetFocusTask}
                        onEdit={handleTaskClick}
                        onPostponeTask={onPostponeTask}
                    />
                ))}
            </div>
        </div>
    );
};

export const ProjectsView: React.FC<ProjectsViewProps> = (props) => {
  const { tasks, projects, categories } = props;
  
  const unassignedTasks = tasks.filter(t => !t.projectId && !t.isDone);

  const handleTaskClick = (task: Task) => {
    if (task.isDone) {
        props.onViewTask(task);
    } else {
        props.onEditTask(task);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in-up">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} {...props} />
      ))}
       <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <i className="fa-solid fa-inbox text-zinc-800 dark:text-zinc-100 text-xl"></i>
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Без проекта</h2>
          </div>
          <div className="space-y-3">
             {unassignedTasks.length > 0 ? (
                unassignedTasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        category={categories.find(c => c.id === task.categoryId)}
                        onUpdate={props.onUpdateTask}
                        onSetFocus={props.onSetFocusTask}
                        onEdit={handleTaskClick}
                        onPostponeTask={props.onPostponeTask}
                    />
                ))
             ) : (
                <EmptyState illustration="all-done" message="Здесь нет задач без проекта. Все организовано!" />
             )}
          </div>
        </div>
    </div>
  );
};
