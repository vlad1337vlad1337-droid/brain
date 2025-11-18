import React from 'react';
import { Project, Task } from '../../types';
import { ProgressRing } from '../ProgressRing';

interface ProjectProgressWidgetProps {
  projects: Project[];
  tasks: Task[];
  config?: { projectId?: string };
  onConfigChange: (config: { projectId?: string }) => void;
}

export const ProjectProgressWidget: React.FC<ProjectProgressWidgetProps> = ({ projects, tasks, config, onConfigChange }) => {
    const selectedProjectId = config?.projectId || (projects.length > 0 ? projects[0].id : undefined);
    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const { progress, completed, total, upcomingTasks } = React.useMemo(() => {
        if (!selectedProject) return { progress: 0, completed: 0, total: 0, upcomingTasks: [] };
        const projectTasks = tasks.filter(t => t.projectId === selectedProject.id);
        const completedCount = projectTasks.filter(t => t.isDone).length;
        const totalCount = projectTasks.length;
        const upcoming = projectTasks.filter(t => !t.isDone).slice(0, 2);
        return {
            progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 100, // Show 100% if no tasks
            completed: completedCount,
            total: totalCount,
            upcomingTasks: upcoming,
        };
    }, [selectedProject, tasks]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <i className="fa-solid fa-diagram-project text-violet-500"></i>
                    Прогресс проекта
                </h3>
                {projects.length > 0 && (
                     <select
                        value={selectedProjectId || ''}
                        onChange={(e) => onConfigChange({ projectId: e.target.value })}
                        className="text-xs bg-transparent border-0 focus:ring-0 p-0 text-zinc-500 dark:text-zinc-400 max-w-[50%] truncate"
                    >
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                )}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                {selectedProject ? (
                    <>
                        <ProgressRing progress={progress} radius={45} stroke={6} />
                        <p className="text-xs font-semibold mt-2 text-zinc-700 dark:text-zinc-300">{completed} / {total} задач</p>
                    </>
                ) : (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Нет проектов для отображения.</p>
                )}
            </div>
            {selectedProject && upcomingTasks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">Следующие шаги:</h4>
                    <ul className="space-y-1">
                        {upcomingTasks.map(task => (
                            <li key={task.id} className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                                <i className="fa-regular fa-circle text-violet-500 mr-2 text-[10px]"></i>
                                {task.title}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};