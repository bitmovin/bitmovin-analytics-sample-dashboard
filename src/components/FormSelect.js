import React from 'react';
const FormSelect = ({className, label, children, defaultValue, onChange}) => {
  return (
    <div className={className}>
      <label>{label}</label>
      <select className="form-control" defaultValue={defaultValue} onChange={onChange}>
        {children}
      </select>
    </div>
  );
};

export default FormSelect;
