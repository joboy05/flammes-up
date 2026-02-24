
// Utilitaire de formatage de dates relatif pour Flammes UP
export function formatRelativeDate(dateInput: string | Date | any): string {
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
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHour < 24) return `Il y a ${diffHour}h`;

    if (diffDay === 1) {
        return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    if (diffDay < 7) {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return `${days[date.getDay()]} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
