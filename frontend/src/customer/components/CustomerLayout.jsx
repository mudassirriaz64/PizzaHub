import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import "../css/customer.css";

function CustomerLayout() {
  return (
    <div className="customer-layout">
      <ScrollToTop />
      <Navbar />
      <main className="customer-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default CustomerLayout;
