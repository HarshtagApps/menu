const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/data');
const outputDir = path.join(__dirname, '../migration_data');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

const headers = [
    'isActive',
    'Category',
    'ItemName',
    'IsVeg',
    'IsSpecial',
    'Size',
    'Price'
];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const restaurantId = data.id;

    const rows = [headers.join(',')];

    data.categories.forEach(category => {
        const categoryName = category.categoryType;
        category.items.forEach(item => {
            // If there are multiple prices (Sizes), create one row per size
            const priceEntries = Object.entries(item.prices);

            priceEntries.forEach(([size, price]) => {
                const row = [
                    'TRUE', // isActive
                    categoryName,
                    item.name,
                    item.isVeg ? 'TRUE' : 'FALSE',
                    item.isSpecial ? 'TRUE' : 'FALSE',
                    size.charAt(0).toUpperCase() + size.slice(1), // Capitalize size (Full, Half, etc.)
                    price
                ].map(val => {
                    if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
                    return val;
                });
                rows.push(row.join(','));
            });
        });
    });

    const outputFilePath = path.join(outputDir, `menu_${restaurantId}.csv`);
    fs.writeFileSync(outputFilePath, rows.join('\n'));
});

console.log(`Successfully split ${files.length} files into ${outputDir}`);
