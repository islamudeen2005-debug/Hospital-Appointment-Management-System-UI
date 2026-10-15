import React, { useEffect, useState } from 'react';
import placeholderImage from '../assets/doctor-placeholder.svg';
import api from '../services/api';

const resolveImageUrl = (value) => {
  if (typeof value === 'string' && value.startsWith('/uploads/')) {
    return `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${value}`;
  }
  return hasUsableImageUrl(value) ? value : placeholderImage;
};

const hasUsableImageUrl = (value) => {
  if (typeof value !== 'string') return false;

  const trimmedValue = value.trim();
  if (!trimmedValue) return false;

  return (
    trimmedValue.startsWith('/') ||
    trimmedValue.startsWith('data:image/') ||
    /^https?:\/\//i.test(trimmedValue)
  );
};

const DoctorImage = ({ imageUrl, name, className = '' }) => {
  const [src, setSrc] = useState(resolveImageUrl(imageUrl));

  useEffect(() => {
    setSrc(resolveImageUrl(imageUrl));
  }, [imageUrl]);

  const handleError = () => {
    if (src !== placeholderImage) {
      setSrc(placeholderImage);
    }
  };

  return (
    <img
      className={className}
      src={src}
      alt={name || 'Doctor'}
      onError={handleError}
    />
  );
};

export default DoctorImage;
