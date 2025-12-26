import { AppColors } from '../theme/colors.js';

export function buildPriceTags(prices) {
    const order = ["small", "medium", "large", "half", "full"];
    const priceWidgets = [];

    for (const key of order) {
        if (prices && prices[key] !== undefined) {
            let label = key.charAt(0).toUpperCase() + key.slice(1);
            if (key === "small") label = "S";
            if (key === "medium") label = "M";
            if (key === "large") label = "L";
            if (key === "half") label = "H";
            if (key === "full") label = "F";

            priceWidgets.push({
                label: label,
                price: prices[key]
            });
        }
    }

    return priceWidgets;
}

export function buildPriceTagsHTML(prices) {
    const tags = buildPriceTags(prices);
    return tags.map(tag =>
        `<span class="price-tag">${tag.label} : ₹${tag.price}</span>`
    ).join('');
}