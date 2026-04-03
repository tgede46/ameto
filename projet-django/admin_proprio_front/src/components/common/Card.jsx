import React from 'react';

const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`card ${hover ? 'hover:shadow-xl' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`p-6 border-b border-border ${className}`}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`p-6 border-t border-border ${className}`}>
      {children}
    </div>
  );
};

export default Card;