import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const SellDog = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    breed: '',
    age: '',
    gender: '',
    dogType: '',
    healthStatus: '',
    vaccinated: '',
    size: '',
    color: '',
    behavior: '',
    image: null,
  });
  const [dogId, setDogId] = useState('');

  useEffect(() => {
    setDogId(uuidv4()); // generate Dog ID on mount
  }, []);

  const breeds = ['Labrador', 'German Shepherd', 'Beagle', 'Pug', 'Bulldog', 'Street Dog', 'Other'];
  const ages = ['1 month', '2 months', '3 months', '6 months', '1 year', '2 years', '3 years', '4 years', '5+ years'];
  const genders = ['Male', 'Female'];
  const dogTypes = ['Home Dog', 'Street Dog'];
  const healthOptions = ['Healthy', 'Needs Care', 'Sick'];
  const vaccinatedOptions = ['Yes', 'No'];
  const sizes = ['Small', 'Medium', 'Large'];
  const colors = ['Black', 'White', 'Brown', 'Golden', 'Mixed', 'Other'];
  const behaviors = ['Friendly', 'Aggressive', 'Calm', 'Active', 'Shy', 'Other'];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();

    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append('dogId', dogId);

    try {
      await axios.post('http://localhost:5000/api/dogs/sell', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert('Dog listed successfully!');
      setDogId(uuidv4()); // generate new ID for next entry
      setForm({
        breed: '',
        age: '',
        gender: '',
        dogType: '',
        healthStatus: '',
        vaccinated: '',
        size: '',
        color: '',
        behavior: '',
        image: null,
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error listing dog');
    }
  };

  const renderSelect = (label, name, value, options) => (
    <select name={name} value={value} onChange={handleChange} required>
      <option value="">{label}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );

  return (
    <div className="sell-dog-form">
      <h2>Sell Your Dog</h2>
      {dogId && (
        <div className="dog-id-row">
          <p><strong>Dog ID:</strong> {dogId}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          {renderSelect('Select Breed', 'breed', form.breed, breeds)}
          {renderSelect('Select Age', 'age', form.age, ages)}
        </div>
        <div className="form-row">
          {renderSelect('Select Gender', 'gender', form.gender, genders)}
          {renderSelect('Dog Type', 'dogType', form.dogType, dogTypes)}
        </div>
        <div className="form-row">
          {renderSelect('Health Status', 'healthStatus', form.healthStatus, healthOptions)}
          {renderSelect('Vaccinated?', 'vaccinated', form.vaccinated, vaccinatedOptions)}
        </div>
        <div className="form-row">
          {renderSelect('Size', 'size', form.size, sizes)}
          {renderSelect('Color', 'color', form.color, colors)}
        </div>
        <div className="form-row">
          {renderSelect('Behavior', 'behavior', form.behavior, behaviors)}
          <input type="file" name="image" accept="image/*" onChange={handleChange} required />
        </div>
        <button type="submit">Submit</button>
      </form>
      <p>
        <button className="btn" onClick={() => navigate('/manage-orders')}>Back to Dashboard</button>
      </p>
    </div>
  );
};

export default SellDog;
