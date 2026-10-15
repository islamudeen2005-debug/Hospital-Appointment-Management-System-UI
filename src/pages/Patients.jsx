import React, { useEffect, useState } from 'react';
import * as adminService from '../services/adminService';
import DoctorImage from '../components/DoctorImage';
import { formatINR } from '../utils/currency';

const PAGE_SIZE = 20;

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await adminService.getPatients({ page, limit: PAGE_SIZE, search: search || undefined });
        setPatients(response.data.patients || []);
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load protected patient records.');
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, [page, search]);

  useEffect(() => setPage(1), [search]);

  return (
    <div className="container section admin-page premium-admin-page">
      <header className="admin-page-heading">
        <div><span className="dashboard-eyebrow">PATIENT SERVICES</span><h1>Patient management</h1><p>Protected patient records and visit history for authorized administrators.</p></div>
      </header>

      {error && <div className="alert error" role="alert">{error}</div>}
      <div className="appointment-filters patient-filters">
        <input type="search" aria-label="Search patients" placeholder="Search by patient name, email, or phone..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <span className="patient-record-count">{pagination.total} registered patients</span>
      </div>

      <section className="analytics-card">
        {loading ? <div className="loading-state">Loading protected patient records...</div> : (
          <>
            {patients.length ? (
              <div className="table-scroll">
                <table className="admin-data-table patient-data-table">
                  <thead><tr><th>Patient</th><th>Contact</th><th>Joined</th><th>Appointments</th><th>History</th></tr></thead>
                  <tbody>
                    {patients.map((patient) => {
                      const history = patient.appointmentHistory || [];
                      const expanded = expandedId === patient._id;
                      return (
                        <React.Fragment key={patient._id}>
                          <tr>
                            <td><strong>{patient.name}</strong></td>
                            <td>{patient.email}<small>{patient.phone || 'Phone not provided'}</small></td>
                            <td>{new Date(patient.createdAt).toLocaleDateString('en-IN')}</td>
                            <td>{history.length}</td>
                            <td><button type="button" className="btn btn-secondary btn-small" onClick={() => setExpandedId(expanded ? '' : patient._id)}>{expanded ? 'Hide history' : 'View history'}</button></td>
                          </tr>
                          {expanded && (
                            <tr className="patient-history-row">
                              <td colSpan="5">
                                {history.length ? (
                                  <div className="patient-history-list">
                                    {history.map((appointment) => (
                                      <div className="patient-history-item" key={appointment._id}>
                                        <DoctorImage className="table-doctor-image" imageUrl={appointment.doctor?.image} name={appointment.doctor?.user?.name} />
                                        <div><strong>{appointment.doctor?.user?.name || 'Doctor'}</strong><small>{appointment.doctor?.specialization || 'Specialty not listed'} · {new Date(appointment.date).toLocaleDateString('en-IN')} at {appointment.timeSlot}</small></div>
                                        <span className={`status-badge status-${appointment.status}`}>{appointment.status}</span>
                                        <b>{formatINR(appointment.fee ?? 0)}</b>
                                      </div>
                                    ))}
                                  </div>
                                ) : <div className="empty-state">No appointment history for this patient.</div>}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <div className="empty-state">No patients match this search.</div>}
            {pagination.pages > 1 && (
              <div className="pagination-controls">
                <span>Page {pagination.page} of {pagination.pages}</span>
                <div>
                  <button className="btn btn-secondary btn-small" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                  <button className="btn btn-secondary btn-small" type="button" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Patients;
