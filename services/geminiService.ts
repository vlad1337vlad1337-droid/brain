import { GoogleGenAI, Type } from "@google/genai";
import { Task, Project, Category, Employee, FinanceCategory, Transaction, Account } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseTaskFromText = async (
    text: string,
    projects: Project[],
    categories: Category[],
    employees: Employee[]
): Promise<Partial<Task>> => {
    try {
        const projectContext = projects.map(p => `id: "${p.id}", name: "${p.name}"`).join('; ');
        const categoryContext = categories.map(c => `id: "${c.id}", name: "${c.name}"`).join('; ');
        const employeeContext = employees.map(e => `id: "${e.id}", name: "${e.name}"`).join('; ');
        const currentDate = new Date().toISOString();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more powerful model for better parsing
            contents: `Проанализируй текст задачи от пользователя и преобразуй его в структурированный JSON.
            Текущая дата: ${currentDate}.

            Контекст для сопоставления:
            - Проекты: [${projectContext}]
            - Категории: [${categoryContext}]
            - Сотрудники: [${employeeContext}]

            Текст задачи: "${text}"

            Правила:
            1.  'title': Извлеки основное действие. Это обязательное поле.
            2.  'timeOfDay': Распознай время дня. "утром", "с утра" -> morning. "днем", "после обеда" -> afternoon. "вечером" -> evening. Если не указано, оставь поле пустым.
            3.  'deadline': Распознай дату и время.
                - "завтра" - это следующий день. "сегодня в 5 вечера" - это сегодня в 17:00.
                - Если указано конкретное время (например, "в 15:30", "at 2 PM"), используй его.
                - Если указано только время дня ('timeOfDay', например, "завтра утром"), установи время дедлайна соответственно: morning -> 09:00, afternoon -> 14:00, evening -> 20:00.
                - Если время или время дня НЕ указано, но указана дата (например, "9 декабря"), установи время на 09:00 утра этого дня. Это гарантирует, что задача будет видна с самого утра.
                - ВАЖНО: Если пользователь говорит "до [ДАТА]" или "к [ДАТЕ]" (например, "до 9 декабря"), установи дедлайн на 18:00 указанной даты. Это правило имеет приоритет над временем дня.
                - Верни результат в формате ISO 8601 БЕЗ указания часового пояса (например, '2024-12-09T15:30:00'). Это гарантирует, что дата будет правильно интерпретирована в локальном времени пользователя. Если дата не указана, оставь поле пустым.
            4.  'priority': Распознай приоритет. "важно", "высокий" -> HIGH. "средний" -> MEDIUM. "низкий" -> LOW. По умолчанию MEDIUM.
            5.  'projectId': Если упоминается проект из контекста, укажи его id.
            6.  'categoryId': Если упоминается категория из контекста, укажи ее id.
            7.  'assignedTo': Если упоминается сотрудник из контекста, укажи его id.

            Верни только JSON.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        deadline: { type: Type.STRING, description: "Дата в формате ISO 8601 без часового пояса" },
                        priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                        projectId: { type: Type.STRING },
                        categoryId: { type: Type.STRING },
                        assignedTo: { type: Type.STRING },
                        timeOfDay: { type: Type.STRING, enum: ['morning', 'afternoon', 'evening']}
                    },
                    required: ['title']
                }
            }
        });
        const jsonString = response.text.trim();
        const parsedTask = JSON.parse(jsonString);
        
        // Convert deadline string to Date object if present
        if (parsedTask.deadline) {
            const parsedDate = new Date(parsedTask.deadline);
            if (!isNaN(parsedDate.getTime())) {
                 parsedTask.deadline = parsedDate;
            } else {
                delete parsedTask.deadline;
            }
        }
        
        return parsedTask;

    } catch (error) {
        console.error("Ошибка парсинга задачи:", error);
        throw new Error("Не удалось распознать детали задачи. Попробуйте переформулировать.");
    }
};

export const parseTransactionsFromFile = async (file: { mimeType: string; data: string }): Promise<{ date: string; description: string; amount: number; type?: 'income' | 'expense' }[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [
                { inlineData: { mimeType: file.mimeType, data: file.data } },
                { text: `Проанализируй документ (банковскую выписку). Извлеки все транзакции в JSON-массив.
                        
                    Правила:
                    1. Каждая транзакция должна содержать дату, описание, сумму и тип (доход/расход).
                    2. Дата находится в первом столбце в формате ДД.ММ.ГГГГ.
                    3. Описание - это "Содержание операции" и может включать информацию из столбцов "Корреспондент" и "Реквизиты документа". Объедини всю релевантную текстовую информацию в одно поле 'description'.
                    4. Сумма находится в столбцах "Дебет" (расход) или "Кредит" (доход). Сумма должна быть положительным числом.
                    5. 'type' должен быть 'expense' для сумм из столбца "Дебет" и 'income' для сумм из столбца "Кредит".
                    6. Игнорируй строки заголовков, итогов ("Обороты за день", "Остаток на начало") и любую другую информацию, не являющуюся транзакцией.
                    7. Числа в тексте могут содержать пробелы как разделители тысяч (напр., "2 124.96"). Парси их корректно.
                    
                    Верни только JSON-массив объектов.`}
            ]},
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: "Дата в формате YYYY-MM-DD" },
                            description: { type: Type.STRING },
                            amount: { type: Type.NUMBER },
                            type: { type: Type.STRING, enum: ['income', 'expense'] }
                        },
                        required: ['date', 'description', 'amount', 'type']
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Ошибка парсинга файла:", error);
        throw new Error("Не удалось распознать транзакции из файла. Убедитесь, что это четкий документ.");
    }
};

export const parseTransactionsFromStatement = async (statementText: string): Promise<{ date: string; description: string; amount: number; type?: 'income' | 'expense' }[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Проанализируй текст банковской выписки. Извлеки все транзакции в JSON-массив.
            
            Текст выписки:
            """
            ${statementText}
            """

            Правила:
            1. Каждая транзакция должна содержать дату, описание, сумму и тип (доход/расход).
            2. Дата находится в первом столбце в формате ДД.ММ.ГГГГ.
            3. Описание - это "Содержание операции" и может включать информацию из столбцов "Корреспондент" и "Реквизиты документа". Объедини всю релевантную текстовую информацию в одно поле 'description'.
            4. Сумма находится в столбцах "Дебет" (расход) или "Кредит" (доход). Сумма должна быть положительным числом.
            5. 'type' должен быть 'expense' для сумм из столбца "Дебет" и 'income' для сумм из столбца "Кредит".
            6. Игнорируй строки заголовков, итогов ("Обороты за день", "Остаток на начало") и любую другую информацию, не являющуюся транзакцией.
            7. Числа в тексте могут содержать пробелы как разделители тысяч (напр., "2 124.96"). Парси их корректно.
            
            Верни только JSON-массив объектов.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: "Дата в формате YYYY-MM-DD" },
                            description: { type: Type.STRING },
                            amount: { type: Type.NUMBER },
                            type: { type: Type.STRING, enum: ['income', 'expense'] }
                        },
                        required: ['date', 'description', 'amount', 'type']
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Ошибка парсинга выписки:", error);
        throw new Error("Не удалось распознать транзакции из документа. Убедитесь, что это четкая банковская выписка.");
    }
};

export const categorizeTransactions = async (
    rawTransactions: { date: string; description: string; amount: number; type?: 'income' | 'expense' }[],
    categories: FinanceCategory[]
): Promise<Omit<Transaction, 'id' | 'accountId'>[]> => {
    try {
        const categoryContext = categories.map(c => `id: "${c.id}", name: "${c.name}", type: "${c.type}"`).join('; ');
        const transactionsContext = rawTransactions.map(t => `date: "${t.date}", description: "${t.description}", amount: ${t.amount}${t.type ? `, type: "${t.type}"` : ''}`).join('\n');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Проанализируй список банковских транзакций и для каждой определи тип и категорию.
            
            Контекст категорий: [${categoryContext}]
            
            Список транзакций:
            ${transactionsContext}
            
            Правила:
            1.  Для каждой транзакции определи 'type' ('income' или 'expense'). Если 'type' уже указан для транзакции, используй его. В противном случае, сумма всегда положительная, и тип определяется по описанию ("Поступление", "зачисление" -> 'income'; "Списание", "покупка", "оплата" -> 'expense').
            2.  Подбери наиболее подходящий 'categoryId' из контекста.
                - 'Перевод средств на карту' от ИП - это 'expense' с категорией 'Перевод на личный счет' (id: fc-exp-transfer).
                - Поступления с ключевыми словами 'кредит', 'заем', 'кредитная линия' должны быть отнесены к категории 'Кредит' (id: fc-inc3).
                - Поступления с ключевым словом 'факторинг' должны быть отнесены к категории 'Факторинг' (id: fc-inc4).
            3.  'description' должен оставаться оригинальным.
            4.  'date' и 'amount' должны оставаться оригинальными.
            5.  Верни массив JSON-объектов. Не включай id или accountId.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            amount: { type: Type.NUMBER },
                            type: { type: Type.STRING, enum: ['income', 'expense'] },
                            categoryId: { type: Type.STRING },
                            date: { type: Type.STRING, description: "Дата в формате YYYY-MM-DD" },
                            description: { type: Type.STRING }
                        },
                        required: ['amount', 'type', 'categoryId', 'date', 'description']
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        const parsedTransactions = JSON.parse(jsonString);

        return parsedTransactions.map((t: any) => ({
            ...t,
            date: new Date(t.date),
        }));
    } catch (error) {
        console.error("Ошибка категоризации транзакций:", error);
        throw new Error("Не удалось автоматически распознать транзакции.");
    }
};


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

export const getFinancialAdvice = async (
    transactions: Transaction[],
    accounts: Account[],
    categories: FinanceCategory[]
): Promise<{ summary: string; tips: string[] }> => {
    try {
        const transactionData = transactions.map(t => {
            const categoryName = categories.find(c => c.id === t.categoryId)?.name || 'Неизвестно';
            const accountName = accounts.find(a => a.id === t.accountId)?.name || 'Неизвестно';
            return {
                date: t.date.toISOString().split('T')[0],
                description: t.description,
                amount: t.amount,
                type: t.type,
                category: categoryName,
                account: accountName,
            }
        });

        const accountData = accounts.map(a => ({ name: a.name, balance: a.balance, type: a.type }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Ты - экспертный финансовый аналитик WASEWORM OC. Твоя задача - проанализировать финансовые данные пользователя и дать четкие, действенные советы на русском языке.

            Вот финансовые данные пользователя за выбранный период:
            Счета: ${JSON.stringify(accountData, null, 2)}
            Транзакции: ${JSON.stringify(transactionData, null, 2)}

            Проанализируй эти данные и сгенерируй ответ в формате JSON со следующей структурой:
            - "summary" (string): Краткий, проницательный обзор финансового положения пользователя на основе данных. Упомяни общий доход, расходы и чистый денежный поток. Будь краток и по делу.
            - "tips" (array of strings): Ровно пять действенных, персонализированных советов по улучшению финансового положения. Советы должны быть напрямую связаны с предоставленными данными. Не давай общих советов. Будь конкретным. Например, вместо "Тратьте меньше" скажи: "Ваши расходы на 'Рестораны' довольно высоки и составляют X RUB. Попробуйте готовить дома чаще, чтобы сэкономить."

            Твои советы должны быть умными и учитывать, что пользователь ведет бизнес (наличие счетов 'ФОТ', 'Реклама' и т.д.).
            `,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        tips: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['summary', 'tips']
                }
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Ошибка получения финансового совета от ИИ:", error);
        return {
            summary: "Не удалось получить анализ от ИИ. Проверьте данные и попробуйте снова.",
            tips: ["Убедитесь, что все транзакции за период были загружены.", "Проверьте правильность категоризации доходов и расходов.", "Попробуйте проанализировать данные самостоятельно и выявить основные статьи расходов.", "Сравните этот период с предыдущим, чтобы увидеть динамику.", "Повторите попытку анализа позже."]
        };
    }
};