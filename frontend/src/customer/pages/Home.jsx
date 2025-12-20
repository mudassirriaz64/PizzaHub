import { Link } from "react-router-dom";
import { ArrowRight, Clock, Truck, Award, ChefHat, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import SizeSelector from "../components/SizeSelector";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [sizeModalProduct, setSizeModalProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch featured products
    fetch("http://localhost/PizzaHub/backend/customer/products/featured.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFeaturedProducts(data.products);
        }
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

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
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>
              Delicious <span>Pizza</span> Delivered To Your Door
            </h1>
            <p>
              Freshly baked with premium ingredients. Order now and get it hot
              and crispy in 30 minutes or less!
            </p>
            <div className="hero-buttons">
              <Link to="/menu" className="btn btn-primary btn-lg">
                Order Now <ArrowRight size={20} />
              </Link>
              <Link to="/menu" className="btn btn-secondary btn-lg">
                View Menu
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/pizza-hero.png"
              alt="Delicious Pizza"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={28} />
              </div>
              <h3>Fast Delivery</h3>
              <p>30 minutes or less, guaranteed</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <ChefHat size={28} />
              </div>
              <h3>Fresh Ingredients</h3>
              <p>Quality ingredients, made fresh daily</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Award size={28} />
              </div>
              <h3>Best Recipes</h3>
              <p>Award-winning authentic recipes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Truck size={28} />
              </div>
              <h3>Free Delivery</h3>
              <p>On orders above Rs. 1000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Popular Pizzas</h2>
            <p>Most loved by our customers</p>
          </div>

          <div className="products-grid">
            {featuredProducts.length > 0
              ? featuredProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-card-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">🍕</div>
                      )}
                      {product.isPopular && (
                        <span className="product-card-badge">Popular</span>
                      )}
                    </div>
                    <div className="product-card-content">
                      <span className="product-card-category">
                        {product.category}
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
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              : // Placeholder cards when no products loaded
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="product-card">
                    <div className="product-card-image">
                      <div className="placeholder-image">🍕</div>
                    </div>
                    <div className="product-card-content">
                      <span className="product-card-category">Pizza</span>
                      <h3 className="product-card-title">
                        Delicious Pizza {i}
                      </h3>
                      <p className="product-card-description">
                        A mouth-watering pizza with premium toppings
                      </p>
                      <div className="product-card-footer">
                        <span className="product-card-price">Rs. 999</span>
                        <button className="product-card-btn">
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link to="/menu" className="btn btn-outline">
              View All Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2>Hungry? Order Now!</h2>
            <p>Get 20% off on your first order. Use code: PIZZA20</p>
            <Link to="/menu" className="btn btn-primary btn-lg">
              Order Now
            </Link>
          </div>
        </div>
      </section>
      <SizeSelector
        isOpen={!!sizeModalProduct}
        onClose={() => setSizeModalProduct(null)}
        product={sizeModalProduct}
        onSelect={handleSizeSelect}
      />
    </div>
  );
}

export default Home;
