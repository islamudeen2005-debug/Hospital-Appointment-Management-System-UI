import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as doctorService from '../services/doctorService';
import DoctorImage from '../components/DoctorImage';
import { formatINR } from '../utils/currency';

const normalizeDoctor = (payload) => {
  if (!payload) return null;

  if (payload.doctor) return payload.doctor;
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    if (payload.data.doctor) return payload.data.doctor;
    return payload.data;
  }

  return payload;
};

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setError('');
        const response = await doctorService.getDoctorById(id);
        const doctorDetails = normalizeDoctor(response.data);
        setDoctor(doctorDetails);
      } catch (error) {
        console.error(error);
        setError('Unable to load doctor details.');
      }
    };

    fetchDoctor();
  }, [id]);

  if (!doctor && !error) {
    return <div className="loading-state">Loading profile...</div>;
  }

  const doctorUser = doctor?.user || {};
  const doctorName = doctorUser.name || doctor?.name || 'Doctor';

  return (
    <div className="container section">
      {error ? (
        <div className="alert error">{error}</div>
      ) : (
        <div className="profile-card doctor-profile-card">
          <div className="doctor-profile-summary">
            <DoctorImage
              className="doctor-profile-image"
              imageUrl={doctor?.image || doctor?.imageUrl}
              name={doctorName}
            />
            <div>
              <h2>{doctorName}</h2>
              <p className="specialization">{doctor?.specialization || 'Specialization not listed'}</p>
              <p><strong>Experience:</strong> {doctor?.experience ?? 'Not listed'} {doctor?.experience != null ? 'years' : ''}</p>
              <p><strong>Consultation fee:</strong> {formatINR(doctor?.fee ?? 0)}</p>
              <p><strong>City:</strong> {doctor?.city || 'Not provided'}</p>
              <p><strong>Email:</strong> {doctorUser.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> {doctorUser.phone || 'Not provided'}</p>
            </div>
          </div>
          <div>
            <h3>Available slots</h3>
            <div className="slot-list">
              {(doctor?.availableSlots || []).map((slot) => (
                <span key={slot} className="slot-pill">{slot}</span>
              ))}
            </div>
            <Link to={`/book/${doctor?._id}`} className="btn btn-primary">Book appointment</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
