import { GoogleGenAI, Type } from "@google/genai";
import { Task, Project } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEndOfDayReview = async (completedTasks: Task[], incompleteTasks: Task[]): Promise<{summary: string}> => {
    try {
        const completedList = completedTasks.map(t => `- ${t.title}`).join('\n');
        const incompleteList = incompleteTasks.map(t => `- ${t.title}`).join('\n');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Подведи итоги дня. Вот что было сделано:\n${completedList}\n\nА вот что осталось:\n${incompleteList}\n\nНапиши короткий (2-3 предложения), поддерживающий и ободряющий отзыв о проделанной работе и мягко напомни о том, что осталось. Сосредоточься на позитиве. Верни JSON с одним ключом "summary".`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "Поддерживающий итог дня."
                        }
                    },
                    required: ['summary']
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Ошибка получения итогов дня:", error);
        return { summary: `Отличная работа сегодня! Вы завершили ${completedTasks.length} задач. Хорошо отдохните, а завтра с новыми силами возьметесь за остальное.` };
    }
}

export const getAnalyticsSummary = async (stats: object): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Проанализируй следующие статистические данные о продуктивности пользователя и напиши краткий (2-4 предложения) вывод на естественном языке. Дай полезные, действенные советы, основанные на данных. Статистика:\n${JSON.stringify(stats, null, 2)}\n\nВерни JSON с одним ключом "summary".`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING }
                    },
                    required: ['summary']
                }
            }
        });
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.summary;
    } catch(error) {
        console.error("Ошибка получения аналитики от ИИ:", error);
        return "Не удалось получить аналитический отчет от ИИ. Попробуйте проанализировать данные самостоятельно или повторите попытку позже.";
    }
};

export const getHolidayDescription = async (holidayName: string, country: 'RU' | 'CN'): Promise<{description: string}> => {
    try {
        const countryName = country === 'RU' ? 'России' : 'Китая';
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Подробно и интересно опиши праздник "${holidayName}" (${countryName}). Расскажи о его истории, традициях и значении. Ответ должен быть увлекательным и познавательным. Верни JSON с одним ключом "description".`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING, description: "Подробное описание праздника." }
                    },
                    required: ['description']
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Ошибка получения описания праздника:", error);
        return { description: "Не удалось загрузить подробное описание праздника. Попробуйте снова позже." };
    }
};
