import { Link } from "react-router-dom";
import {
  Pizza,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>
              Pizza<span>Hub</span>
            </h3>
            <p>
              Serving the most delicious pizzas in town since 2020. Made with
              fresh ingredients and baked with love.
            </p>
            <div className="footer-social">
              <button className="footer-social-btn">
                <Facebook size={18} />
              </button>
              <button className="footer-social-btn">
                <Instagram size={18} />
              </button>
              <button className="footer-social-btn">
                <Twitter size={18} />
              </button>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/menu">Menu</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Menu</h4>
            <ul>
              <li>
                <Link to="/menu?category=pizza">Pizzas</Link>
              </li>
              <li>
                <Link to="/menu?category=sides">Sides</Link>
              </li>
              <li>
                <Link to="/menu?category=drinks">Drinks</Link>
              </li>
              <li>
                <Link to="/menu?category=desserts">Desserts</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>
                <MapPin
                  size={14}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                123 Pizza Street, Islamabad
              </li>
              <li>
                <Phone
                  size={14}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                +92 300 1234567
              </li>
              <li>
                <Mail
                  size={14}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                hello@pizzahub.pk
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} PizzaHub. All rights reserved.
          </p>
          <p>Made with ❤️ in Pakistan</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
