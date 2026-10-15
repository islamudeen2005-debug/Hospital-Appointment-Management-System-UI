import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as doctorService from '../services/doctorService';
import * as appointmentService from '../services/AppointmentService';
import { formatINR } from '../utils/currency';

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await doctorService.getDoctorById(id);
        setDoctor(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDoctor();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) {
        setSlots([]);
        setSelectedSlot('');
        return;
      }

      try {
        const response = await doctorService.getDoctorSlots(id, selectedDate);
        setSlots(response.data.slots || []);
        setSelectedSlot('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load slots.');
      }
    };

    fetchSlots();
  }, [id, selectedDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDate || !selectedSlot) {
      setError('Please choose a date and time slot.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await appointmentService.createAppointment({ doctorId: id, date: selectedDate, timeSlot: selectedSlot });
      navigate('/my-appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Appointment booking failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <div className="loading-state">Loading doctor details...</div>;

  return (
    <div className="container section">
      <div className="booking-layout">
        <div className="profile-card">
          <h2>{doctor.user?.name}</h2>
          <p className="specialization">{doctor.specialization}</p>
          <p><strong>Experience:</strong> {doctor.experience} years</p>
          <p><strong>City:</strong> {doctor.city || 'Not provided'}</p>
          <p><strong>Fee:</strong> {formatINR(doctor.fee ?? 0)}</p>
        </div>

        <form className="profile-card" onSubmit={handleSubmit}>
          <h3>Book appointment</h3>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Select time</label>
            <div className="slot-list">
              {slots.length ? (
                slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-pill ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))
              ) : (
                <span className="empty-state small">No available slots for the selected date.</span>
              )}
            </div>
          </div>

          {error && <div className="alert error">{error}</div>}

          <button className="btn btn-primary full-width" type="submit" disabled={loading || !selectedSlot}>
            {loading ? 'Booking...' : 'Confirm appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
