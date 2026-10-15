import React, { useEffect, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard';
import * as appointmentService from '../services/AppointmentService';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter((appointment) => appointment.status === filter);

  const handleCancel = async (id) => {
    try {
      await appointmentService.cancelAppointment(id);
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container section">
      <div className="section-heading">
        <h2>My appointments</h2>
      </div>

      <div className="filters-panel">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="appointment-list">
        {filteredAppointments.length ? (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              role="patient"
              onCancel={handleCancel}
            />
          ))
        ) : (
          <div className="empty-state">No appointments found.</div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
