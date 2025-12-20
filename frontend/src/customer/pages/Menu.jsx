import { useState, useEffect } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useCart } from "../context/CartContext";
import SizeSelector from "../components/SizeSelector";

function Menu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sizeModalProduct, setSizeModalProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch categories
    fetch("http://localhost/PizzaHub/backend/customer/products/categories.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));

    // Fetch products
    fetch("http://localhost/PizzaHub/backend/customer/products/index.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      product.categoryId === parseInt(selectedCategory);
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Price filter
    let matchesPrice = true;
    if (priceRange !== "all") {
      const price = Number(product.price);
      switch (priceRange) {
        case "under500":
          matchesPrice = price < 500;
          break;
        case "500to1000":
          matchesPrice = price >= 500 && price <= 1000;
          break;
        case "1000to2000":
          matchesPrice = price >= 1000 && price <= 2000;
          break;
        case "over2000":
          matchesPrice = price > 2000;
          break;
        default:
          matchesPrice = true;
      }
    }

    return matchesCategory && matchesSearch && matchesPrice;
  });

  const handleAddToCart = (product) => {
    // If product has sizes, show size selector
    if (
      product.hasSizes &&
      product.sizes &&
      Object.keys(product.sizes).length > 0
    ) {
      setSizeModalProduct(product);
    } else {
      // Add directly without size
      addToCart(product, 1);
    }
  };

  const handleSizeSelect = (product, quantity, size) => {
    const price = size ? product.sizes[size] : product.price;
    addToCart(
      {
        ...product,
        price: price,
      },
      quantity,
      size
    );
    setSizeModalProduct(null);
  };

  return (
    <div className="menu-page">
      <div className="menu-container">
        <div className="menu-header">
          <h1>Our Menu</h1>
          <p>Fresh ingredients, authentic recipes, made with love</p>
        </div>

        {/* Search Bar */}
        <div className="menu-search">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for pizzas, sides, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="price-filter">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="price-filter-select"
            >
              <option value="all">All Prices</option>
              <option value="under500">Under Rs. 500</option>
              <option value="500to1000">Rs. 500 - 1,000</option>
              <option value="1000to2000">Rs. 1,000 - 2,000</option>
              <option value="over2000">Over Rs. 2,000</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          <button
            className={`category-pill ${
              selectedCategory === "all" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-pill ${
                selectedCategory === String(category.id) ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(String(category.id))}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading-state">
            <p>Loading menu...</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-card-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="placeholder-image">🍕</div>
                    )}
                    {!product.isAvailable && (
                      <span className="product-card-badge out-of-stock">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="product-card-content">
                    <span className="product-card-category">
                      {product.categoryName}
                    </span>
                    <h3 className="product-card-title">{product.name}</h3>
                    <p className="product-card-description">
                      {product.description}
                    </p>
                    <div className="product-card-footer">
                      <span className="product-card-price">
                        {product.hasSizes && (
                          <span className="price-from">from </span>
                        )}
                        Rs. {product.price.toLocaleString()}
                      </span>
                      <button
                        className="product-card-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.isAvailable}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>No products found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Size Selector Modal */}
      {sizeModalProduct && (
        <SizeSelector
          product={sizeModalProduct}
          onSelect={handleSizeSelect}
          onClose={() => setSizeModalProduct(null)}
        />
      )}
    </div>
  );
}

export default Menu;
