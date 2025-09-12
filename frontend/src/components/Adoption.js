import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Adoption = () => {
  const [dogs, setDogs] = useState([]);
  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('All'); // Dropdown state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDogs = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/dogs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDogs(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDogs();
  }, []);

  // Get unique breeds for the dropdown
  const breeds = ['All', ...new Set(dogs.map(d => d.breed))];

  // Filter dogs by text search and dropdown breed
  const filteredDogs = dogs.filter(dog => {
    const matchesSearch = dog.breed?.toLowerCase().includes(search.toLowerCase());
    const matchesBreed = breedFilter === 'All' || dog.breed === breedFilter;
    return matchesSearch && matchesBreed;
  });

  const handleViewDetails = (dogId) => {
    navigate(`/dog-details/${dogId}`);
  };

  if (loading) return <div className="adoption">Loading...</div>;
  if (error) return <div className="adoption">{error}</div>;

  return (
    <div className="adoption">
      <h1>Dog Adoption Center</h1>

      {/* Filters */}
      <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {/* Text search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by breed..."
          style={{ padding: '8px', width: '200px' }}
        />
        {/* Dropdown breed filter */}
        <select
          value={breedFilter}
          onChange={(e) => setBreedFilter(e.target.value)}
          style={{ padding: '8px', width: '150px' }}
        >
          {breeds.map((b, i) => (
            <option key={i} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Dog List */}
      <div
        className="dog-list"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          minHeight: '400px',
        }}
      >
        {filteredDogs.length > 0 ? (
          filteredDogs.map(dog => (
            <div
              className="dog-card"
              key={dog._id}
              style={{
                width: '200px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  width: '150px',
                  height: '120px',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  margin: '0 auto 10px',
                  backgroundColor: '#f0f0f0',
                }}
              >
                <img
                  src={dog.image ? dog.image : 'http://localhost:5000/uploads/placeholder-image.jpg'}
                  alt={dog.breed}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { e.target.src = 'http://localhost:5000/uploads/placeholder-image.jpg'; }}
                />
              </div>
              <p><strong>Dog ID:</strong> {dog.dogId}</p>
              <p><strong>Breed:</strong> {dog.breed}</p>
              <p><strong>Age:</strong> {dog.age}</p>
              <p><strong>Gender:</strong> {dog.gender}</p>
              <button
                onClick={() => handleViewDetails(dog._id)}
                style={{
                  marginTop: '10px',
                  padding: '6px 12px',
                  backgroundColor: '#ff6f61',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <p>No dogs found.</p>
        )}
      </div>
    </div>
  );
};

export default Adoption;
