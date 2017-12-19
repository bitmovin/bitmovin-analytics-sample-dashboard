import React from 'react';
import './LoadingIndicator.css';

export default function LoadingIndicator({ loading, children }) {
  const wrapperClasses = ['LoadingIndicator'];
  if (loading) {
    wrapperClasses.push('loading');
  }

  return (
    <div className={wrapperClasses.join(' ')}>
      {children}
    </div>
  )
}
