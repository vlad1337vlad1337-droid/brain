import { Task, Project } from '../types';

export interface DateRange {
  start: Date;
  end: Date;
}

export const calculateStats = (tasks: Task[], projects: Project[], range: DateRange) => {
  const completedTasks = tasks.filter(t => 
    t.isDone && 
    t.completedAt && 
    new Date(t.completedAt) >= range.start && 
    new Date(t.completedAt) <= range.end
  );

  const totalCompleted = completedTasks.length;

  // Productivity by day of the week
  const dayOfWeekCounts: Record<string, number> = { 'Пн': 0, 'Вт': 0, 'Ср': 0, 'Чт': 0, 'Пт': 0, 'Сб': 0, 'Вс': 0 };
  const dayMapping = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const dayIndex = new Date(task.completedAt).getDay();
      dayOfWeekCounts[dayMapping[dayIndex]]++;
    }
  });

  // Productivity by project
  const projectCounts: Record<string, number> = {};
  completedTasks.forEach(task => {
    const projectName = projects.find(p => p.id === task.projectId)?.name || 'Без проекта';
    projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;
  });

  // Productivity over time (for line chart)
  const activity: Record<string, number> = {};
  const current = new Date(range.start);
  while (current <= range.end) {
    const dateString = current.toISOString().split('T')[0];
    activity[dateString] = 0;
    current.setDate(current.getDate() + 1);
  }
  completedTasks.forEach(task => {
    if (task.completedAt) {
        const dateString = new Date(task.completedAt).toISOString().split('T')[0];
        if (activity[dateString] !== undefined) {
             activity[dateString]++;
        }
    }
  });

  // Find most productive day
  const mostProductiveDayEntry = Object.entries(dayOfWeekCounts).reduce((max, entry) => entry[1] > max[1] ? entry : max, ["", 0]);
  const mostProductiveDay = mostProductiveDayEntry[1] > 0 ? mostProductiveDayEntry[0] : null;
  
  return {
    totalCompleted,
    dayOfWeekCounts,
    projectCounts,
    activity,
    mostProductiveDay,
  };
};
