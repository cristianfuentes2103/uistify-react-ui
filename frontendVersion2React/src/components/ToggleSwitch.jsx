function ToggleSwitch({ isChecked, onToggle }) {
  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggle(); 
  };

  return (
    <div className="toggle-switch-container" onClick={handleToggle}>
      <label className="switch">
        <input 
          type="checkbox" 
          className="checkbox"
          checked={isChecked}
          readOnly 
        />
        <div className="slider"></div>
      </label>
    </div>
  );
}

export default ToggleSwitch;