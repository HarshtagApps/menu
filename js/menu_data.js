import { ProjectImages } from '../theme/images.js';

export const MenuData = {
    items: [
        { image: ProjectImages.rice, name: "Rice" },
        { image: ProjectImages.rice, name: "Rice & Biryani" },
        { image: ProjectImages.roti, name: "Roti" },
        { image: ProjectImages.roti, name: "Roti & Parantha" },
        { image: ProjectImages.dahi, name: "Dahi" },
        { image: ProjectImages.soup, name: "Soup" },
        { image: ProjectImages.pizza, name: "Pizza" },
        { image: ProjectImages.momos, name: "Momos" },
        { image: ProjectImages.pasta, name: "Pasta" },
        { image: ProjectImages.salad, name: "Salad" },
        { image: ProjectImages.tikka, name: "Tikka" },
        { image: ProjectImages.water, name: "Water" },
        { image: ProjectImages.coffee, name: "Coffee" },
        { image: ProjectImages.coffee, name: "Tea & Coffee" },
        { image: ProjectImages.shakes, name: "Shakes" },
        { image: ProjectImages.burger, name: "Burgers" },
        { image: ProjectImages.hotDog, name: "Hotdog" },
        { image: ProjectImages.chinese, name: "Chinese" },
        { image: ProjectImages.noodles, name: "Noodles" },
        { image: ProjectImages.iceCream, name: "Ice Cream" },
        { image: ProjectImages.sandwich, name: "Sandwich" },
        { image: ProjectImages.frenchFries, name: "Fries" },
        { image: ProjectImages.frenchFries, name: "Snacks" },
        { image: ProjectImages.mocktail, name: "Mocktails" },
        { image: ProjectImages.mocktail, name: "Beverages" },
        { image: ProjectImages.mainCourse, name: "Main Course" },
        { image: ProjectImages.cheese, name: "Paneer" },
        { image: ProjectImages.indian, name: "Indian" },
        { image: ProjectImages.eggs, name: "Eggs/Omelette" },
        { image: ProjectImages.cake, name: "Dessert" },
    ]
};

export function getImageForCategory(categoryType) {
    const menuItem = MenuData.items.find(
        item => item.name.toLowerCase() === categoryType.toLowerCase()
    );
    if (!menuItem) return '';
    return menuItem.image.startsWith('/') ? menuItem.image.substring(1) : menuItem.image;
}