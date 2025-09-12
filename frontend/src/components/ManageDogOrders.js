import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageDogOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const confirmOrder = async (index) => {
    const order = orders[index];
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${order._id}`,
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrders = orders.map((o, i) =>
        i === index ? { ...o, status: 'confirmed' } : o
      );
      setOrders(updatedOrders);
      alert(`${order.dogId.breed}'s order is confirmed!`);
    } catch (err) {
      console.error(err);
      alert('Error confirming order');
    }
  };

  const markSold = async (index) => {
    const order = orders[index];
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${order._id}`,
        { status: 'sold' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrders = orders.map((o, i) =>
        i === index ? { ...o, status: 'sold' } : o
      );
      setOrders(updatedOrders);
      alert(`${order.dogId.breed} is marked as Sold!`);
    } catch (err) {
      console.error(err);
      alert('Error marking as sold');
    }
  };

  const cancelOrder = async (index) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const order = orders[index];
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedOrders = orders.filter((_, i) => i !== index);
        setOrders(updatedOrders);
        alert(`${order.dogId.breed} order deleted.`);
      } catch (err) {
        console.error(err);
        alert('Error deleting order');
      }
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>{error}</div>;
  if (orders.length === 0) return <div>No orders found.</div>;

  return (
    <div className="manage-orders">
      <h1>Manage Dog Orders</h1>
      <table
        border="1"
        cellPadding="10"
        style={{ width: '100%', borderCollapse: 'collapse' }}
      >
        <thead>
          <tr>
            <th>Dog Image</th>
            <th>Dog ID</th>
            <th>Breed</th>
            <th>Status</th>
            <th>Customer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order._id}>
              <td>
                <div
                  style={{
                    width: '100px',
                    height: '80px',
                    overflow: 'hidden',
                    borderRadius: '8px',
                  }}
                >
                  <img
                    src={
                      order.dogId?.image && order.dogId.image.trim() !== ''
                        ? `http://localhost:5000/uploads/${order.dogId.image.split('/').pop()}`
                        : 'http://localhost:5000/uploads/placeholder-image.jpg'
                    }
                    alt={order.dogId?.breed || 'Dog'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.target.src =
                        'http://localhost:5000/uploads/placeholder-image.jpg';
                    }}
                  />
                </div>
              </td>
              <td>{order.dogId?.dogId || 'N/A'}</td>
              <td>{order.dogId?.breed || 'N/A'}</td>
              <td>{order.status}</td>
              <td>{order.customerName || 'N/A'}</td>
              <td>
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => confirmOrder(index)}>Confirm</button>{' '}
                    <button onClick={() => markSold(index)}>Mark Sold</button>{' '}
                    <button onClick={() => cancelOrder(index)}>Cancel</button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <>
                    <button onClick={() => markSold(index)}>Mark Sold</button>{' '}
                    <button onClick={() => cancelOrder(index)}>Cancel</button>
                  </>
                )}
                {order.status === 'sold' && <span>Sold</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <button onClick={() => navigate('/sell-dog')}>Back to Sell Dog</button>
      </p>
    </div>
  );
};

export default ManageDogOrders;
