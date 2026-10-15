import React, { useEffect, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard';
import * as appointmentService from '../services/AppointmentService';
import * as doctorService from '../services/doctorService';
import DoctorImage from '../components/DoctorImage';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('all');
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (!user) return undefined;

    let isCurrent = true;
    const fetchDoctorProfile = async () => {
      try {
        const response = await doctorService.getDoctors();
        const profile = response.data.find((doctor) => (
          (doctor.user?._id && String(doctor.user._id) === String(user._id))
          || (doctor.user?.email && doctor.user.email === user.email)
        ));
        if (isCurrent) {
          setDoctorProfile(profile || null);
          setProfileError('');
        }
      } catch (error) {
        console.error(error);
        if (isCurrent) {
          setProfileError('Unable to load doctor profile details.');
        }
      }
    };

    fetchDoctorProfile();
    return () => {
      isCurrent = false;
    };
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAppointments({ status: status === 'all' ? '' : status });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [status]);

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(id, nextStatus);
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter((item) => item.status === 'pending').length,
    confirmed: appointments.filter((item) => item.status === 'confirmed').length,
    completed: appointments.filter((item) => item.status === 'completed').length,
  };

  return (
    <div className="container section">
      {user && (
        <section className="doctor-dashboard-profile profile-card">
          <DoctorImage
            className="doctor-dashboard-image"
            imageUrl={doctorProfile?.image || doctorProfile?.imageUrl || user.image || user.imageUrl}
            name={doctorProfile?.user?.name || user.name || 'Doctor'}
          />
          <div className="doctor-dashboard-details">
            <h2>{doctorProfile?.user?.name || user.name || 'Doctor'}</h2>
            <p className="specialization">
              {doctorProfile?.specialization || user.specialization || 'Specialization not listed'}
            </p>
            <p><strong>Experience:</strong> {doctorProfile?.experience ?? user.experience ?? 'Not listed'}{doctorProfile?.experience != null || user.experience != null ? ' years' : ''}</p>
            <p className="doctor-availability">
              <span className="availability-indicator" />
              {doctorProfile?.availableSlots?.length
                ? `${doctorProfile.availableSlots.length} available slots`
                : 'Availability not listed'}
            </p>
            {profileError && <p className="profile-load-error">{profileError}</p>}
          </div>
        </section>
      )}

      <div className="dashboard-grid">
        <div className="stat-card"><span>Total</span><strong>{stats.total}</strong></div>
        <div className="stat-card"><span>Pending</span><strong>{stats.pending}</strong></div>
        <div className="stat-card"><span>Confirmed</span><strong>{stats.confirmed}</strong></div>
        <div className="stat-card"><span>Completed</span><strong>{stats.completed}</strong></div>
      </div>

      <div className="filters-panel">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="appointment-list">
        {appointments.length ? (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              role="doctor"
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <div className="empty-state">No appointments to show.</div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
