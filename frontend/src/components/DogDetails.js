import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DogDetails = () => {
  const { dogId } = useParams();
  const [dog, setDog] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDog = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/dogs/${dogId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDog(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dog details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDog();
  }, [dogId]);

  const handleAdopt = () => setShowConfirm(true);

  const handleConfirmAdopt = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5000/api/orders',
        { dogId: dog._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Adoption request sent!');
      navigate('/adoption');
    } catch (err) {
      console.error(err);
      alert('Error sending adoption request.');
    } finally {
      setShowConfirm(false);
    }
  };

  const handleCancelAdopt = () => setShowConfirm(false);

  if (loading) return <div>Loading dog details...</div>;
  if (error) return <div>{error}</div>;
  if (!dog) return <div>No dog found.</div>;

  return (
    <div className="adoption-page">
      <h1>Dog Details</h1>
      <div className="dog-card" style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '200px',
            height: '160px',
            overflow: 'hidden',
            margin: '0 auto 10px',
            borderRadius: '8px',
            backgroundColor: '#f0f0f0',
          }}
        >
          <img
            src={
              dog.image
                ? dog.image // ✅ Use the backend URL directly
                : 'http://localhost:5000/uploads/placeholder-image.jpg'
            }
            alt={dog.breed}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'http://localhost:5000/uploads/placeholder-image.jpg';
            }}
          />
        </div>
        <h3>{dog.breed}</h3>
        <p><strong>Dog ID:</strong> {dog.dogId}</p>
        <p><strong>Age:</strong> {dog.age}</p>
        <p><strong>Gender:</strong> {dog.gender}</p>
        <p><strong>Type:</strong> {dog.dogType}</p>
        <p><strong>Health:</strong> {dog.healthStatus}</p>
        <p><strong>Vaccinated:</strong> {dog.vaccinated}</p>
        <p><strong>Size:</strong> {dog.size}</p>
        <p><strong>Color:</strong> {dog.color}</p>
        <p><strong>Behavior:</strong> {dog.behavior}</p>
        <button onClick={handleAdopt}>Adopt Me</button>
      </div>

      {showConfirm && (
        <div className="modal">
          <div className="modal-content">
            <p>Confirm adoption of <strong>{dog.breed}</strong>?</p>
            <button onClick={handleConfirmAdopt}>Yes</button>
            <button onClick={handleCancelAdopt}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DogDetails;
