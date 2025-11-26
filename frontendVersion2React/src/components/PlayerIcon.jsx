const playIconSVG = (
  <svg role="img" height="24" width="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path>
  </svg>
);

const pauseIconSVG = (
  <svg role="img" height="24" width="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5.7 3a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7H5.7zm10 0a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7h-2.6z"></path>
  </svg>
);

// El componente recibe una prop 'type' que puede ser 'play' o 'pause'
function PlayerIcon({ type }) {
  if (type === 'pause') {
    return pauseIconSVG;
  }
  return playIconSVG; // Por defecto, muestra el icono de play
}

export default PlayerIcon;