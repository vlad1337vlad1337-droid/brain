import { Holiday } from '../types';

// Данные о праздниках на 2024 год.
// Даты лунных праздников (например, Китайский Новый год) меняются каждый год.
// В реальном приложении эти данные должны поступать из API.

const holidays: Record<string, Holiday> = {
    // === Россия ===

    // Январь
    '1-1': { name: 'Новый год', country: 'RU', isPublic: true },
    '1-2': { name: 'Новогодние каникулы', country: 'RU', isPublic: true },
    '1-3': { name: 'Новогодние каникулы', country: 'RU', isPublic: true },
    '1-4': { name: 'Новогодние каникулы', country: 'RU', isPublic: true },
    '1-5': { name: 'Новогодние каникулы', country: 'RU', isPublic: true },
    '1-6': { name: 'Новогодние каникулы', country: 'RU', isPublic: true },
    '1-7': { name: 'Рождество Христово', country: 'RU', isPublic: true },
    '1-8': { name: 'Новогодние каникулы', country: 'RU', isPublic: true },
    
    // Февраль
    '2-23': { name: 'День защитника Отечества', country: 'RU', isPublic: true },

    // Март
    '3-8': { name: 'Международный женский день', country: 'RU', isPublic: true },

    // Апрель/Май
    '4-29': { name: 'Майские праздники', country: 'RU', isPublic: true },
    '4-30': { name: 'Майские праздники', country: 'RU', isPublic: true },
    '5-1': { name: 'Праздник Весны и Труда', country: 'RU', isPublic: true },
    '5-9': { name: 'День Победы', country: 'RU', isPublic: true },
    '5-10': { name: 'Майские праздники', country: 'RU', isPublic: true },

    // Июнь
    '6-12': { name: 'День России', country: 'RU', isPublic: true },

    // Ноябрь
    '11-4': { name: 'День народного единства', country: 'RU', isPublic: true },

    // === Китай (на 2024 год) ===

    // Февраль - Праздник весны (Китайский Новый год)
    '2-10': { name: 'Китайский Новый год (Чуньцзе)', country: 'CN', isPublic: true },
    '2-11': { name: 'Китайский Новый год (Чуньцзе)', country: 'CN', isPublic: true },
    '2-12': { name: 'Китайский Новый год (Чуньцзе)', country: 'CN', isPublic: true },
    '2-13': { name: 'Китайский Новый год (Чуньцзе)', country: 'CN', isPublic: true },
    '2-14': { name: 'Китайский Новый год (Чуньцзе)', country: 'CN', isPublic: true },
    '2-15': { name: 'Китайский Новый год (Чуньцзе)', country: 'CN', isPublic: true },
    '2-16': { name: 'Китайский Новый год (Чуньцзе)', country: 'CN', isPublic: true },
    '2-17': { name: 'Китайский Новый год (Чуньцзе)', country: 'CN', isPublic: true },
    
    // Апрель - День поминовения усопших
    '4-4': { name: 'День поминовения усопших (Цинмин)', country: 'CN', isPublic: true },
    '4-5': { name: 'День поминовения усопших (Цинмин)', country: 'CN', isPublic: true },
    '4-6': { name: 'День поминовения усопших (Цинмин)', country: 'CN', isPublic: true },

    // Июнь - Праздник драконьих лодок
    '6-10': { name: 'Праздник драконьих лодок (Дуаньу)', country: 'CN', isPublic: true },

    // Сентябрь - Праздник середины осени
    '9-15': { name: 'Праздник середины осени', country: 'CN', isPublic: true },
    '9-16': { name: 'Праздник середины осени', country: 'CN', isPublic: true },
    '9-17': { name: 'Праздник середины осени', country: 'CN', isPublic: true },

    // Октябрь - День образования КНР (Золотая неделя)
    '10-1': { name: 'День образования КНР', country: 'CN', isPublic: true },
    '10-2': { name: 'Золотая неделя', country: 'CN', isPublic: true },
    '10-3': { name: 'Золотая неделя', country: 'CN', isPublic: true },
    '10-4': { name: 'Золотая неделя', country: 'CN', isPublic: true },
    '10-5': { name: 'Золотая неделя', country: 'CN', isPublic: true },
    '10-6': { name: 'Золотая неделя', country: 'CN', isPublic: true },
    '10-7': { name: 'Золотая неделя', country: 'CN', isPublic: true },
};

/**
 * Returns the name of a public holiday for a given date, if one exists.
 * @param date The date to check.
 * @returns The Holiday object or null.
 */
export const getHoliday = (date: Date): Holiday | null => {
    // Format: "Month-Day", e.g., "1-1" for January 1st.
    const key = `${date.getMonth() + 1}-${date.getDate()}`;
    return holidays[key] || null;
};