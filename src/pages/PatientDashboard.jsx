import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as appointmentService from '../services/AppointmentService';

const getRequestError = (error) => (
  error.response?.data?.message
  || error.message
  || 'Could not load your appointments. Please try again.'
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await appointmentService.getMyAppointments();
      const results = response.data?.appointments;
      if (!Array.isArray(results)) {
        throw new Error('The appointments service returned an unexpected response.');
      }
      setAppointments(results);
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return (
          ['pending', 'confirmed'].includes(appointment.status)
          && !Number.isNaN(appointmentDate.getTime())
          && appointmentDate >= today
        );
      })
      .sort((first, second) => new Date(first.date) - new Date(second.date))
      .slice(0, 4);
  }, [appointments]);

  const stats = [
    { label: 'Total appointments', value: appointments.length },
    { label: 'Upcoming', value: upcomingAppointments.length },
    { label: 'Pending', value: appointments.filter((item) => item.status === 'pending').length },
    { label: 'Completed', value: appointments.filter((item) => item.status === 'completed').length },
  ];

  return (
    <div className="container section">
      <div className="section-heading">
        <div>
          <h2>Patient dashboard</h2>
          <p>Welcome{user?.name ? `, ${user.name}` : ''}. Here is your appointment overview.</p>
        </div>
        <Link to="/doctors" className="btn btn-primary">Find a doctor</Link>
      </div>

      {loading ? (
        <div className="loading-state">Loading your appointments...</div>
      ) : error ? (
        <div className="alert error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn-secondary" onClick={loadAppointments}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="section-heading">
            <h3>Upcoming appointments</h3>
            <Link to="/my-appointments">View all appointments</Link>
          </div>

          {upcomingAppointments.length ? (
            <div className="appointment-list">
              {upcomingAppointments.map((appointment) => {
                const appointmentDate = new Date(appointment.date);
                const doctorName = appointment.doctor?.user?.name || 'Doctor';

                return (
                  <article className="appointment-card" key={appointment._id}>
                    <div className="appointment-top">
                      <div>
                        <h4>{doctorName}</h4>
                        <p>
                          {appointmentDate.toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          {appointment.timeSlot ? ` · ${appointment.timeSlot}` : ''}
                        </p>
                      </div>
                      <span className={`status-badge status-${appointment.status}`}>
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.reason && (
                      <div className="appointment-details">
                        <p><strong>Reason:</strong> {appointment.reason}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              No upcoming appointments. Find a doctor to book your first visit.
            </div>
          )}

          <div className="hero-actions">
            <Link to="/my-appointments" className="btn btn-secondary">Manage appointments</Link>
            <Link to="/profile" className="btn btn-secondary">View profile</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDashboard;
