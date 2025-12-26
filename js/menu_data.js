import { ProjectImages } from '../theme/images.js';

export const MenuData = {
    items: [
        { image: ProjectImages.rice, name: "Rice" },
        { image: ProjectImages.roti, name: "Roti" },
        { image: ProjectImages.dahi, name: "Dahi" },
        { image: ProjectImages.soup, name: "Soup" },
        { image: ProjectImages.pizza, name: "Pizza" },
        { image: ProjectImages.momos, name: "Momos" },
        { image: ProjectImages.pasta, name: "Pasta" },
        { image: ProjectImages.salad, name: "Salad" },
        { image: ProjectImages.tikka, name: "Tikka" },
        { image: ProjectImages.water, name: "Water" },
        { image: ProjectImages.coffee, name: "Coffee" },
        { image: ProjectImages.shakes, name: "Shakes" },
        { image: ProjectImages.burger, name: "Burger" },
        { image: ProjectImages.hotDog, name: "Hotdog" },
        { image: ProjectImages.chinese, name: "Chinese" },
        { image: ProjectImages.noodles, name: "Noodles" },
        { image: ProjectImages.iceCream, name: "Dessert" },
        { image: ProjectImages.sandwich, name: "Sandwich" },
        { image: ProjectImages.frenchFries, name: "Fries" },
        { image: ProjectImages.mocktail, name: "Mocktails" },
        { image: ProjectImages.mainCourse, name: "Main Course" }
    ]
};

export function getImageForCategory(categoryType) {
    const menuItem = MenuData.items.find(
        item => item.name.toLowerCase() === categoryType.toLowerCase()
    );
    if (!menuItem) return '';
    return menuItem.image.startsWith('/') ? menuItem.image.substring(1) : menuItem.image;
}