import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <h4>CareConnect Hospital</h4>
          <p>Advanced healthcare for every patient journey.</p>
        </div>
        <div>
          <h5>Navigation</h5>
          <ul>
            <li>Home</li>
            <li>Doctors</li>
            <li>Appointments</li>
          </ul>
        </div>
        <div>
          <h5>Contact</h5>
          <ul>
            <li>+1 (800) 555-0199</li>
            <li>hello@careconnect.health</li>
            <li>24/7 Support</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
