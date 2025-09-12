import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div>
      <header>
        <h1>Welcome to Dog World</h1>
      </header>
      <div className="login-options">
        <Link to="/login_user" className="btn">User Login</Link>
        <Link to="/login_seller" className="btn">Seller Login</Link>
      </div>
    </div>
  );
};

export default Index;