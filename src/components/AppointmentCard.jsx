import React from 'react';

const AppointmentCard = ({ appointment, role = 'patient', onCancel, onStatusChange }) => {
  if (!appointment) return null;

  const doctorName = appointment.doctor?.user?.name || 'Doctor';
  const appointmentDate = new Date(appointment.date).toLocaleDateString();

  return (
    <div className="appointment-card">
      <div className="appointment-top">
        <div>
          <h4>{doctorName}</h4>
          <p>{appointmentDate} • {appointment.timeSlot}</p>
        </div>
        <span className={`status-badge status-${appointment.status}`}>{appointment.status}</span>
      </div>

      <div className="appointment-details">
        <p><strong>Patient:</strong> {appointment.patient?.name || 'Patient'}</p>
        <p><strong>Doctor:</strong> {doctorName}</p>
      </div>

      <div className="appointment-actions">
        {role === 'patient' && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <button type="button" className="btn btn-secondary btn-small" onClick={() => onCancel(appointment._id)}>
            Cancel
          </button>
        )}

        {role === 'doctor' && onStatusChange && (
          <>
            {appointment.status === 'pending' && (
              <button type="button" className="btn btn-primary btn-small" onClick={() => onStatusChange(appointment._id, 'confirmed')}>
                Confirm
              </button>
            )}
            {appointment.status === 'confirmed' && (
              <button type="button" className="btn btn-success btn-small" onClick={() => onStatusChange(appointment._id, 'completed')}>
                Complete
              </button>
            )}
            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
              <button type="button" className="btn btn-secondary btn-small" onClick={() => onStatusChange(appointment._id, 'cancelled')}>
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
