import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  Package,
  X,
  Check,
} from "lucide-react";
import api from "../services/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/index.php");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Category name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const response = await api.put("/categories/index.php", {
          id: editingCategory.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        if (response.data.success) {
          setCategories(
            categories.map((c) =>
              c.id === editingCategory.id
                ? {
                    ...c,
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                  }
                : c
            )
          );
        }
      } else {
        const response = await api.post("/categories/index.php", {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        if (response.data.success) {
          setCategories([...categories, response.data.category]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError("Failed to save category. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    try {
      const response = await api.delete("/categories/index.php", {
        data: { id: category.id },
      });
      if (response.data.success) {
        setCategories(categories.filter((c) => c.id !== category.id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete category");
    }
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p>Manage product categories</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} />
          <h3>No categories found</h3>
          <p>Start by adding your first category.</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={20} />
            Add Category
          </button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-icon">
                <FolderOpen size={24} />
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.description || "No description"}</p>
                <div className="category-stats">
                  <Package size={14} />
                  <span>{category.productCount} products</span>
                </div>
              </div>
              <div className="category-actions">
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(category)}
                  title="Edit category"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => setDeleteConfirm(category)}
                  title="Delete category"
                  disabled={category.productCount > 0}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? "Edit Category" : "Add New Category"}</h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <div className="error-banner">{formError}</div>}

              <div className="form-group">
                <label htmlFor="name">Category Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Update"
                    : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Category</h3>
            <p>Are you sure you want to delete "{deleteConfirm.name}"?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
