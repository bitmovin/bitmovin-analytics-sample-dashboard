import React from 'react'

const ToggleButton = ({ label, checked, onChange }) => {
  return (
		<div className="togglebutton">
			<label>
				 {label}<input type="checkbox" onChange={() => { onChange(!checked); }} checked={ checked ? 'checked' : '' } /><span className="toggle"></span>
			</label>
		</div>
  );
}

export default ToggleButton;
