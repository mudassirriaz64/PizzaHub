import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  Package,
  DollarSign,
  Check,
  X,
  Eye,
} from "lucide-react";
import api from "../services/api";
import ProductModal from "../components/ProductModal";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await api.get(`/products/index.php?${params}`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/index.php");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    try {
      const response = await api.post("/products/delete.php", {
        id: product.id,
      });
      if (response.data.success) {
        setProducts(products.filter((p) => p.id !== product.id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleModalSubmit = async (productData) => {
    try {
      if (editingProduct) {
        const response = await api.post("/products/update.php", {
          id: editingProduct.id,
          ...productData,
        });
        if (response.data.success) {
          setProducts(
            products.map((p) =>
              p.id === editingProduct.id ? response.data.product : p
            )
          );
        }
      } else {
        const response = await api.post("/products/create.php", productData);
        if (response.data.success) {
          setProducts([response.data.product, ...products]);
        }
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Failed to save product:", error);
      throw error;
    }
  };

  const toggleAvailability = async (product) => {
    try {
      const response = await api.post("/products/update.php", {
        id: product.id,
        isAvailable: !product.isAvailable,
      });
      if (response.data.success) {
        setProducts(
          products.map((p) =>
            p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to update availability:", error);
    }
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="products-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ backgroundColor: "transparent", border: "none", outline: "none", boxShadow: "none" }}
          />
        </div>
        <div className="filter-box">
          <Filter size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
          >
            <option value={0}>All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="products-count">
          <Package size={18} />
          <span>{products.length} products</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>No products found</h3>
          <p>Start by adding your first product to the catalog.</p>
          <button className="btn btn-primary" onClick={handleAddProduct}>
            <Plus size={20} />
            Add Product
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className={`product-card has-tooltip ${
                !product.isAvailable ? "unavailable" : ""
              }`}
              data-tooltip={product.description || "No description available"}
            >
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="image-placeholder">
                    <Package size={32} />
                  </div>
                )}
                <span
                  className={`availability-badge ${
                    product.isAvailable ? "available" : "unavailable"
                  }`}
                >
                  {product.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="product-info">
                <span className="product-category">{product.categoryName}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">
                  {product.description || "No description"}
                </p>
                {product.hasSizes &&
                product.sizes &&
                product.sizes.length > 0 ? (
                  <div className="product-sizes">
                    {product.sizes.map((size, idx) => (
                      <div key={idx} className="size-row">
                        <span className="size-label">{size.name}</span>
                        <span className="size-price">Rs. {size.price}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="product-price">
                    <span>Rs. {product.price}</span>
                  </div>
                )}
              </div>
              <div className="product-actions">
                <button
                  className="action-btn toggle-btn"
                  onClick={() => toggleAvailability(product)}
                  title={
                    product.isAvailable ? "Mark unavailable" : "Mark available"
                  }
                >
                  {product.isAvailable ? <Check size={18} /> : <X size={18} />}
                </button>
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEditProduct(product)}
                  title="Edit product"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="action-btn view-btn"
                  onClick={() => setViewDetails(product)}
                  title="View details"
                >
                  <Eye size={18} />
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => setDeleteConfirm(product)}
                  title="Delete product"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSubmit={handleModalSubmit}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product</h3>
            <p>
              Are you sure you want to delete "{deleteConfirm.name}"? This
              action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteProduct(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetails && (
        <div className="modal-overlay" onClick={() => setViewDetails(null)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setViewDetails(null)}>
              <X size={20} />
            </button>
            <div className="details-content">
              <div className="details-image">
                {viewDetails.image ? (
                  <img src={viewDetails.image} alt={viewDetails.name} />
                ) : (
                  <div className="image-placeholder">
                    <Package size={64} />
                  </div>
                )}
              </div>
              <div className="details-info">
                <span className="details-category">
                  {viewDetails.categoryName}
                </span>
                <h2 className="details-name">{viewDetails.name}</h2>

                <div className="details-section">
                  <h4>Product Description</h4>
                  <p>
                    {viewDetails.description || "No description available."}
                  </p>
                </div>

                {viewDetails.hasSizes &&
                viewDetails.sizes &&
                viewDetails.sizes.length > 0 ? (
                  <div className="details-section">
                    <h4>Available Sizes</h4>
                    <div className="details-sizes">
                      {viewDetails.sizes.map((size, idx) => (
                        <div key={idx} className="details-size-chip">
                          <span>{size.name}</span>
                          <strong>Rs. {size.price}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="details-price">
                    <span>Price</span>
                    <strong>Rs. {viewDetails.price}</strong>
                  </div>
                )}

                <div className="details-status">
                  <span
                    className={`status-badge ${
                      viewDetails.isAvailable ? "available" : "unavailable"
                    }`}
                  >
                    {viewDetails.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
