import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import * as doctorService from '../services/doctorService';

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeaturedDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorService.getDoctors();
      const doctors = Array.isArray(response?.data) ? response.data : [];
      setFeaturedDoctors(doctors.slice(0, 3));
    } catch (loadError) {
      console.error('Failed to fetch doctors:', loadError);
      setError(loadError?.response?.data?.message || 'Unable to load doctors right now. Please try again.');
      setFeaturedDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedDoctors();
  }, []);

  const stats = useMemo(() => {
    const doctorCount = featuredDoctors.length || 0;
    const uniqueSpecializations = new Set(
      featuredDoctors
        .map((doctor) => doctor.specialization)
        .filter(Boolean)
    );

    return {
      doctorCount,
      specialtyCount: uniqueSpecializations.size,
      completedAppointments: 0,
    };
  }, [featuredDoctors]);

  return (
    <div>
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-text">
            <span className="eyebrow">Trusted care, easier booking</span>
            <h1>Healthcare that feels personal.</h1>
            <p>
              Book appointments with top specialists, track your treatment and stay connected with a
              digital health experience built for modern patient care.
            </p>
            <div className="hero-actions">
              <Link to="/doctors" className="btn btn-primary">Find a doctor</Link>
              <Link to="/register" className="btn btn-secondary">Create account</Link>
            </div>
          </div>
          <div className="hero-panel">
            <div className="mini-stat">
              <strong>{stats.doctorCount}</strong>
              <span>Registered doctors</span>
            </div>
            <div className="mini-stat">
              <strong>{stats.specialtyCount}</strong>
              <span>Available specialties</span>
            </div>
            <div className="mini-stat">
              <strong>{stats.completedAppointments}</strong>
              <span>Appointments completed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>Featured doctors</h2>
            <Link to="/doctors">View all</Link>
          </div>

          {loading ? (
            <div className="loading-state">Loading featured doctors...</div>
          ) : error ? (
            <div className="empty-state error-message">
              <p>{error}</p>
              <button type="button" className="btn btn-primary btn-small" onClick={fetchFeaturedDoctors}>
                Retry
              </button>
            </div>
          ) : featuredDoctors.length > 0 ? (
            <div className="doctor-grid">
              {featuredDoctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p>No doctors are available right now.</p>
              <p>Seed demo doctor profiles or check the backend connection.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section muted-section">
        <div className="container process-grid">
          <div className="process-card">
            <h3>1. Search doctors</h3>
            <p>Browse specialists by field, experience and consultation fee.</p>
          </div>
          <div className="process-card">
            <h3>2. Select a slot</h3>
            <p>Choose the most convenient date and time available for your visit.</p>
          </div>
          <div className="process-card">
            <h3>3. Confirm visit</h3>
            <p>Receive appointment visibility for both patients and doctors in one place.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
