

export class DateUtils {

    static formatFechaLargaPorIdiomaLocalStorage(fecha: Date): string {
        const savedLang = localStorage.getItem('app-language');
        let locale = 'es-ES'; // Valor por defecto
        if (savedLang) {
            if (savedLang === 'es') {
                locale = 'es-ES';
            } else if (savedLang === 'en') {
                locale = 'en-US';
            } else if (savedLang === 'pr') {
                locale = 'pt-BR';
            }
        } 

        return fecha.toLocaleDateString(locale, {
            weekday: 'long', // martes
            year: 'numeric', // 2025
            month: 'long',   // diciembre
            day: 'numeric'   // 23
        });
    }
}