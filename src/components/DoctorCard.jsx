import React from 'react';
import { Link } from 'react-router-dom';
import DoctorImage from './DoctorImage';
import { formatINR } from '../utils/currency';

const DoctorCard = ({ doctor }) => {
  if (!doctor) return null;

  const doctorUser = doctor.user || {};
  const doctorName = doctorUser.name || doctor.name || 'Doctor';
  const doctorImage = doctor.image || doctor.imageUrl || '';
  const availableSlots = Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [];

  return (
    <div className="doctor-card">
      <DoctorImage
        className="doctor-card-image"
        imageUrl={doctorImage}
        name={doctorName}
      />
      <h3>{doctorName}</h3>
      <p className="specialization">{doctor.specialization || 'General practice'}</p>
      <div className="doctor-meta">
        <span>{doctor.experience ?? 0} yrs experience</span>
        <span>{formatINR(doctor.fee ?? 0)}</span>
      </div>
      <p className="doctor-availability">
        <span className="availability-indicator" />
        {availableSlots.length ? `${availableSlots.length} available slots` : 'Availability not listed'}
      </p>
      <div className="doctor-actions">
        <Link to={`/doctors/${doctor._id}`} className="btn btn-secondary btn-small">
          View profile
        </Link>
        <Link to={`/book/${doctor._id}`} className="btn btn-primary btn-small">
          Book now
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
