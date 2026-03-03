
// Utilitaire de formatage de dates relatif pour Flammes UP
export function formatRelativeDate(dateInput: string | Date | any, compact = false): string {
    let date: Date;

    if (!dateInput) return '';

    if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else if (dateInput?.toDate) {
        // Firebase Timestamp
        date = dateInput.toDate();
    } else if (dateInput?.seconds) {
        // Raw Firestore timestamp
        date = new Date(dateInput.seconds * 1000);
    } else {
        return '';
    }

    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = yesterday.toDateString() === date.toDateString();

    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (isToday) {
        if (diffSec < 60) return "À l'instant";
        if (diffMin < 60) return `${diffMin} min`;
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    if (isYesterday) {
        if (compact) return "Hier";
        return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDay < 7) {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        if (compact) return days[date.getDay()];
        return `${days[date.getDay()]} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
