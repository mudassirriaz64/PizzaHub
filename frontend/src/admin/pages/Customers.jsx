import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import api from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      const response = await api.get(`/users/index.php?${params}`);
      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage customer accounts</p>
        </div>
      </div>

      <div className="customers-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="customers-count">
          <Users size={18} />
          <span>{customers.length} customers</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No customers found</h3>
          <p>Customer accounts will appear here once they register.</p>
        </div>
      ) : (
        <div className="customers-grid">
          {customers.map((customer) => (
            <div key={customer.id} className="customer-card">
              <div className="customer-avatar">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="customer-info">
                <h3>{customer.name}</h3>
                <div className="customer-detail">
                  <Mail size={14} />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="customer-detail">
                    <Phone size={14} />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="customer-detail">
                    <MapPin size={14} />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>
              <div className="customer-stats">
                <div className="stat">
                  <ShoppingBag size={16} />
                  <span>{customer.totalOrders} orders</span>
                </div>
                <div className="stat">
                  <span>Rs. {customer.totalSpent.toFixed(2)} spent</span>
                </div>
              </div>
              <div className="customer-joined">
                Joined {formatDate(customer.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Customers;
