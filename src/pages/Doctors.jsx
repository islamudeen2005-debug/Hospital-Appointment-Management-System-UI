import React, { useEffect, useMemo, useState } from 'react';
import DoctorCard from '../components/DoctorCard';
import doctorService from '../services/doctorService';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorService.getDoctors({ search, specialization });
      setDoctors(Array.isArray(response?.data) ? response.data : []);
    } catch (loadError) {
      console.error(loadError);
      setDoctors([]);
      setError(loadError?.response?.data?.message || 'Unable to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization]);

  const specializations = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))],
    [doctors]
  );

  return (
    <div className="container section">
      <div className="section-heading">
        <h2>Our doctors</h2>
      </div>

      <div className="filters-panel">
        <input
          type="text"
          placeholder="Search by doctor or specialization"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
          <option value="">All specializations</option>
          {specializations.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading doctors...</div>
      ) : error ? (
        <div className="empty-state error-message">
          <p>{error}</p>
          <button type="button" className="btn btn-primary btn-small" onClick={fetchDoctors}>
            Retry
          </button>
        </div>
      ) : doctors.length ? (
        <div className="doctor-grid">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No doctors match your search.</div>
      )}
    </div>
  );
};

export default Doctors;
