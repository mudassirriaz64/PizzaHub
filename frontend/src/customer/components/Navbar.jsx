import { Link, NavLink, useNavigate } from "react-router-dom";
import { Pizza, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Pizza size={24} />
          </div>
          <span className="navbar-logo-text">
            Pizza<span>Hub</span>
          </span>
        </Link>

        <div className="navbar-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/menu"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Menu
          </NavLink>
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-cart">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="navbar-user-dropdown" ref={userMenuRef}>
              <button
                className="navbar-user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User size={18} />
                <span>Hi, {user.name?.split(" ")[0] || "User"}</span>
                <ChevronDown
                  size={16}
                  className={userMenuOpen ? "rotate" : ""}
                />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown-menu">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-user-btn">
              <User size={18} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
