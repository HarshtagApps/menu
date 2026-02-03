import { useNavigate, useSearchParams } from 'react-router-dom';
import { getImageForCategory } from '../utils/menuData';
import '../styles/menu.css';
import '../styles/styles.css';

const Categories = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');
    if (!restaurantData) return null;
    const { restoDetails, categories } = restaurantData;
    const isPremiumPlan = restoDetails?.plan === 'premium';
    const restoName = (restoDetails?.restoName || '').toUpperCase();
    const restoAddress = restoDetails?.address || '';
    const restoContact = restoDetails?.contact || '';
    const uniqueCategories = [...new Set((categories || []).map(cat => cat.categoryType))];
    const handleCategoryClick = (categoryType) => {
        navigate(`/items?r=${restaurantId}&category=${encodeURIComponent(categoryType)}`);
    };
    const handleOrderClick = () => {
        navigate(`/order?r=${restaurantId}`);
    };

    return (
        <div id="mainContent">
            <div className="restaurant-header">
                <div className="restaurant-header-content">
                    <div className="restaurant-name">{restoName}</div>
                    <div className="restaurant-info-row">
                        <div className="restaurant-info-column">
                            <div className="restaurant-address">{restoAddress}</div>
                            <div className="restaurant-contact">
                                {restoContact ? `Ph: +91 ${restoContact}` : ''}
                            </div>
                        </div>
                        {isPremiumPlan && (
                            <button className="order-button" onClick={handleOrderClick}>
                                <img src="assets/images/order.png" alt="Order" />
                                <span className="order-button-text">Order Here</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className="restaurant-divider"></div>
            </div>

            <div className="menu-container">
                {uniqueCategories.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🍽️</div>
                        <div className="empty-title">No menu items yet</div>
                        <div className="empty-subtitle">Tap the edit icon to add items</div>
                    </div>
                ) : (
                    <div className="categories-grid">
                        {uniqueCategories.map((categoryType, index) => {
                            const image = getImageForCategory(categoryType);
                            return (
                                <div
                                    key={index}
                                    className="category-card"
                                    onClick={() => handleCategoryClick(categoryType)}
                                >
                                    <div className="category-image-container">
                                        {image ? (
                                            <img src={image} alt={categoryType} className="category-image" />
                                        ) : (
                                            <div className="category-icon">🍽️</div>
                                        )}
                                    </div>
                                    <div className="category-name">{categoryType}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
