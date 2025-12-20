import { useState, useEffect } from "react";
import { X, Search, User, UserPlus } from "lucide-react";
import api from "../services/api";

function CustomerModal({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState("search"); // search or guest
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    if (activeTab === "search" && searchQuery.length > 1) {
      const timer = setTimeout(() => {
        searchCustomers();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  const searchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/index.php?search=${searchQuery}`);
      if (response.data.success) {
        setSearchResults(response.data.customers);
      }
    } catch (error) {
      console.error("Failed to search customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (guestName.trim()) {
      onSelect({ name: guestName.trim(), type: "guest" });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Customer</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="customer-tabs">
          <button
            className={`tab-btn ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <User size={18} />
            Registered Customer
          </button>
          <button
            className={`tab-btn ${activeTab === "guest" ? "active" : ""}`}
            onClick={() => setActiveTab("guest")}
          >
            <UserPlus size={18} />
            Guest / Walk-in
          </button>
        </div>

        <div className="modal-body">
          {activeTab === "search" ? (
            <div className="search-section">
              <div className="search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ backgroundColor: "transparent", border: "none", outline: "none", boxShadow: "none" }}
                  autoFocus
                />
              </div>

              <div className="search-results">
                {loading ? (
                  <div className="loading-state">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((customer) => (
                    <div
                      key={customer.id}
                      className="customer-item"
                      onClick={() =>
                        onSelect({ ...customer, type: "registered" })
                      }
                    >
                      <div className="customer-avatar">
                        <User size={20} />
                      </div>
                      <div className="customer-details">
                        <span className="customer-name">{customer.name}</span>
                        <span className="customer-contact">
                          {customer.email} • {customer.phone || "No phone"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : searchQuery.length > 1 ? (
                  <div className="empty-state">No customers found</div>
                ) : (
                  <div className="empty-state">
                    Type to search registered customers
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleGuestSubmit} className="guest-form">
              <div className="form-group">
                <label>Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                  autoFocus
                />
              </div>
              <p className="helper-text">
                For walk-in customers who don't have an account.
              </p>
              <button type="submit" className="btn btn-primary full-width">
                Continue as Guest
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerModal;
