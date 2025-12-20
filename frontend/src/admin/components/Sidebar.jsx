import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Receipt,
  BarChart3,
  Users,
  Pizza,
  MonitorSmartphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { path: "/admin/pos", icon: MonitorSmartphone, label: "POS" },
  { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { path: "/admin/products", icon: Package, label: "Products" },
  { path: "/admin/categories", icon: FolderOpen, label: "Categories" },
  { path: "/admin/reports", icon: BarChart3, label: "Reports" },
  { path: "/admin/customers", icon: Users, label: "Customers" },
];

function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Pizza size={32} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand">
            <h1>PizzaHub</h1>
            <span>Admin Panel</span>
          </div>
        )}
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                title={collapsed ? item.label : ""}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-version">
            <Receipt size={16} />
            <span>v1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
