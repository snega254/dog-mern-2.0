import React from 'react';
import { useNavigate } from 'react-router-dom';


const SellerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login_seller');
  };

  return (
    <div>
      <header>
        <h1>Seller Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="card-container">
        {/* First Row */}
        <div className="card" onClick={() => navigate('/sell_dog')}>
          <img src="/logo/s1.jpg" alt="Sell Dogs" />
          <h3>Sell Dogs</h3>
        </div>

        <div className="card" onClick={() => navigate('/sell_products')}>
          <img src="/logo/s2.jpg" alt="Sell Products" />
          <h3>Sell Products</h3>
        </div>

        {/* Second Row */}
        <div className="card coming-soon" onClick={() => navigate('/manage_dog_orders')}>
          <img src="/logo/s3.jpg" alt="Manage Dog Orders" />
          <h3>Manage Dog Orders</h3>
        </div>

        <div className="card coming-soon" onClick={() => navigate('/manage_product_orders')}>
          <img src="/logo/s4.jpg" alt="Manage Product Orders" />
          <h3>Manage Product Orders</h3>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
