import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as appointmentService from '../services/AppointmentService';
import * as doctorService from '../services/doctorService';
import DoctorImage from '../components/DoctorImage';
import { formatINR } from '../utils/currency';

const PAGE_SIZE = 10;

const AllAppointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState(searchParams.get('doctorId') || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    doctorService.getDoctors()
      .then((response) => setDoctors(Array.isArray(response.data) ? response.data : []))
      .catch((loadError) => setError(loadError.response?.data?.message || 'Unable to load doctor filters.'));
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        const params = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (doctorFilter) params.doctorId = doctorFilter;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        const response = await appointmentService.getAppointments(params);
        setAppointments(response.data.appointments || []);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [statusFilter, doctorFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (doctorFilter) setSearchParams({ doctorId: doctorFilter }, { replace: true });
    else setSearchParams({}, { replace: true });
  }, [doctorFilter, setSearchParams]);

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return appointments;
    return appointments.filter((appointment) => [
      appointment._id,
      appointment.patient?.name,
      appointment.patient?.email,
      appointment.doctor?.user?.name,
      appointment.doctor?.specialization,
      appointment.timeSlot,
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [appointments, search]);

  const pageCount = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));
  const visibleAppointments = filteredAppointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, doctorFilter, dateFrom, dateTo]);

  const handleStatusChange = async (appointment, nextStatus) => {
    if (nextStatus === 'cancelled' && !window.confirm('Cancel this appointment? This releases the selected slot.')) return;

    try {
      setBusyId(appointment._id);
      setError('');
      setNotice('');
      await appointmentService.updateAppointmentStatus(appointment._id, nextStatus);
      setNotice(`Appointment ${nextStatus === 'completed' ? 'marked completed' : nextStatus} successfully.`);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (doctorFilter) params.doctorId = doctorFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const response = await appointmentService.getAppointments(params);
      setAppointments(response.data.appointments || []);
      if (selectedAppointment?._id === appointment._id) setSelectedAppointment(null);
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'Unable to update appointment status.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="container section admin-page premium-admin-page">
      <header className="admin-page-heading">
        <div><span className="dashboard-eyebrow">CARE OPERATIONS</span><h1>Appointments</h1><p>Search, review, and update patient visits.</p></div>
      </header>

      {error && <div className="alert error" role="alert">{error}</div>}
      {notice && <div className="alert success" role="status">{notice}</div>}

      <section className="appointment-filters" aria-label="Appointment filters">
        <input aria-label="Search appointments" type="search" placeholder="Search patient, doctor, ID..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter by doctor" value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)}>
          <option value="">All doctors</option>
          {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.user?.name || doctor.name}</option>)}
        </select>
        <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {['pending', 'confirmed', 'completed', 'cancelled', 'rejected'].map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
        </select>
        <label className="date-filter">From<input aria-label="From date" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
        <label className="date-filter">To<input aria-label="To date" type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} /></label>
      </section>

      <section className="analytics-card appointments-table-card">
        {loading ? <div className="loading-state">Loading appointments...</div> : (
          <>
            <div className="table-toolbar"><span>{filteredAppointments.length} appointment{filteredAppointments.length === 1 ? '' : 's'}</span><span>Amounts shown in INR</span></div>
            {visibleAppointments.length ? (
              <div className="table-scroll">
                <table className="admin-data-table appointment-data-table">
                  <thead><tr><th>Appointment</th><th>Patient</th><th>Doctor</th><th>Date &amp; time</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {visibleAppointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td><span className="appointment-id">#{String(appointment._id).slice(-8).toUpperCase()}</span></td>
                        <td><strong>{appointment.patient?.name || 'Patient'}</strong><small>{appointment.patient?.email || ''}</small></td>
                        <td>
                          <div className="table-doctor-cell">
                            <DoctorImage className="table-doctor-image" imageUrl={appointment.doctor?.image} name={appointment.doctor?.user?.name || 'Doctor profile unavailable'} />
                            <div><strong>{appointment.doctor?.user?.name || 'Doctor profile unavailable'}</strong><small>{appointment.doctor?.specialization || 'Specialty not listed'}</small></div>
                          </div>
                        </td>
                        <td>{new Date(appointment.date).toLocaleDateString('en-IN')}<small>{appointment.timeSlot}</small></td>
                        <td>{formatINR(appointment.fee ?? appointment.doctor?.fee ?? 0)}</td>
                        <td><span className={`status-badge status-${appointment.status}`}>{appointment.status}</span></td>
                        <td>
                          <div className="table-action-group">
                            <button type="button" className="btn btn-secondary btn-small" onClick={() => setSelectedAppointment(appointment)}>Details</button>
                            {appointment.status === 'pending' && <button type="button" className="btn btn-success btn-small" disabled={busyId === appointment._id} onClick={() => handleStatusChange(appointment, 'confirmed')}>Confirm</button>}
                            {appointment.status === 'confirmed' && <button type="button" className="btn btn-success btn-small" disabled={busyId === appointment._id} onClick={() => handleStatusChange(appointment, 'completed')}>Complete</button>}
                            {['pending', 'confirmed'].includes(appointment.status) && <button type="button" className="btn btn-danger btn-small" disabled={busyId === appointment._id} onClick={() => handleStatusChange(appointment, 'cancelled')}>Cancel</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="empty-state">No appointments match the selected filters.</div>}
            {filteredAppointments.length > PAGE_SIZE && (
              <div className="pagination-controls">
                <span>Page {page} of {pageCount}</span>
                <div>
                  <button className="btn btn-secondary btn-small" type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                  <button className="btn btn-secondary btn-small" type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {selectedAppointment && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedAppointment(null); }}>
          <section className="appointment-detail-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-detail-title">
            <button type="button" className="modal-close" aria-label="Close details" onClick={() => setSelectedAppointment(null)}>×</button>
            <span className="dashboard-eyebrow">APPOINTMENT DETAILS</span>
            <h2 id="appointment-detail-title">#{String(selectedAppointment._id).toUpperCase()}</h2>
            <div className="appointment-detail-grid">
              <div><span>Patient</span><strong>{selectedAppointment.patient?.name || 'Patient'}</strong><small>{selectedAppointment.patient?.email || ''}</small></div>
              <div><span>Doctor</span><strong>{selectedAppointment.doctor?.user?.name || 'Doctor profile unavailable'}</strong><small>{selectedAppointment.doctor?.specialization || ''}</small></div>
              <div><span>Date &amp; time</span><strong>{new Date(selectedAppointment.date).toLocaleDateString('en-IN')} · {selectedAppointment.timeSlot}</strong></div>
              <div><span>Consultation fee</span><strong>{formatINR(selectedAppointment.fee ?? selectedAppointment.doctor?.fee ?? 0)}</strong></div>
              <div><span>Status</span><strong><span className={`status-badge status-${selectedAppointment.status}`}>{selectedAppointment.status}</span></strong></div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedAppointment(null)}>Close</button>
          </section>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;
