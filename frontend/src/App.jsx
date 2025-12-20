import { Routes, Route, Navigate } from "react-router-dom";
// Admin imports
import AdminLogin from "./admin/pages/AdminLogin";
import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import Categories from "./admin/pages/Categories";
import Orders from "./admin/pages/Orders";
import POS from "./admin/pages/POS";
import Reports from "./admin/pages/Reports";
import Customers from "./admin/pages/Customers";
import AdminProfile from "./admin/pages/Profile";
import Settings from "./admin/pages/Settings";
import { AuthProvider as AdminAuthProvider } from "./admin/context/AuthContext";
import { ThemeProvider } from "./theme/ThemeContext";
import ProtectedRoute from "./admin/components/ProtectedRoute";
// Customer imports
import CustomerLayout from "./customer/components/CustomerLayout";
import Home from "./customer/pages/Home";
import Menu from "./customer/pages/Menu";
import Cart from "./customer/pages/Cart";
import { CartProvider } from "./customer/context/CartContext";
import { AuthProvider as CustomerAuthProvider } from "./customer/context/AuthContext";
import Login from "./customer/pages/Login";
import Register from "./customer/pages/Register";
import Checkout from "./customer/pages/Checkout";
import OrderSuccess from "./customer/pages/OrderSuccess";
import CustomerProfile from "./customer/pages/Profile";
import "./global.css";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Customer routes */}
        <Route
          path="/*"
          element={
            <CartProvider>
              <CustomerAuthProvider>
                <Routes>
                  <Route element={<CustomerLayout />}>
                    <Route index element={<Home />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="profile" element={<CustomerProfile />} />
                    <Route
                      path="order-success/:orderId"
                      element={<OrderSuccess />}
                    />
                  </Route>
                </Routes>
              </CustomerAuthProvider>
            </CartProvider>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <AdminAuthProvider>
              <Routes>
                <Route path="login" element={<AdminLogin />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="pos" element={<POS />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminAuthProvider>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
