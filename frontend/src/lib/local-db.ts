// Simple local storage helper for demo persistence
export function saveItem(type: 'moneyBoxes' | 'circles' | 'gifts', item: any) {
    if (typeof window === 'undefined') return;

    try {
        const stored = localStorage.getItem("minties_data");
        const data = stored ? JSON.parse(stored) : { moneyBoxes: [], circles: [], gifts: [] };

        // Add new item
        data[type].push(item);

        localStorage.setItem("minties_data", JSON.stringify(data));

        // Notify listeners
        window.dispatchEvent(new Event("minties_data_updated"));
    } catch (e) {
        console.error("Failed to save item", e);
    }
}
