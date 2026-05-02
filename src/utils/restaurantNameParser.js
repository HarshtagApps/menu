export const parseRestaurantName = (name) => {
    if (!name) return [];

    const segments = [];
    let currentIndex = 0;
    const nameLength = name.length;

    while (currentIndex < nameLength) {
        // Check for brackets [...]
        if (name[currentIndex] === '[') {
            const endIndex = name.indexOf(']', currentIndex);
            if (endIndex !== -1) {
                const content = name.substring(currentIndex + 1, endIndex);
                if (content.trim()) {
                    segments.push({
                        text: content.trim(),
                        type: 'bracket'
                    });
                }
                currentIndex = endIndex + 1;
                continue;
            }
        }

        // Check for parentheses (...)
        if (name[currentIndex] === '(') {
            const endIndex = name.indexOf(')', currentIndex);
            if (endIndex !== -1) {
                const content = name.substring(currentIndex + 1, endIndex);
                if (content.trim()) {
                    segments.push({
                        text: content.trim(),
                        type: 'parentheses'
                    });
                }
                currentIndex = endIndex + 1;
                continue;
            }
        }

        // Handle normal text (before any brackets or parentheses)
        let nextBracketIndex = name.indexOf('[', currentIndex);
        let nextParenthesesIndex = name.indexOf('(', currentIndex);
        
        let nextSpecialIndex = -1;
        if (nextBracketIndex !== -1 && nextParenthesesIndex !== -1) {
            nextSpecialIndex = Math.min(nextBracketIndex, nextParenthesesIndex);
        } else if (nextBracketIndex !== -1) {
            nextSpecialIndex = nextBracketIndex;
        } else if (nextParenthesesIndex !== -1) {
            nextSpecialIndex = nextParenthesesIndex;
        }

        if (nextSpecialIndex !== -1) {
            const normalText = name.substring(currentIndex, nextSpecialIndex);
            if (normalText.trim()) {
                segments.push({
                    text: normalText.trim(),
                    type: 'normal'
                });
            }
            currentIndex = nextSpecialIndex;
        } else {
            // No more special characters, get remaining text
            const remainingText = name.substring(currentIndex);
            if (remainingText.trim()) {
                segments.push({
                    text: remainingText.trim(),
                    type: 'normal'
                });
            }
            currentIndex = nameLength;
        }
    }

    return segments;
};

export const getRestaurantNameClass = (type) => {
    switch (type) {
        case 'bracket':
            return 'restaurant-name-bracket';
        case 'parentheses':
            return 'restaurant-name-parentheses';
        default:
            return 'restaurant-name';
    }
};
