import noVolumeUrl from '../assets/icons/NoVolume.svg';
import midVolumeUrl from '../assets/icons/MidVolume.svg';
import maxVolumeUrl from '../assets/icons/MaxVolume.svg';


function VolumeIcon({ volume }) {
  let iconUrl; 
  let altText = "Volumen"; 

  // Lógica para decidir qué URL de icono usar
  if (volume === 0) {
    iconUrl = noVolumeUrl;
    altText = "Silencio";
  } else if (volume > 0 && volume <= 0.5) {
    iconUrl = midVolumeUrl;
    altText = "Volumen bajo";
  } else {
    iconUrl = maxVolumeUrl;
    altText = "Volumen alto";
  }
  
  return <img src={iconUrl} alt={altText} className="volume-icon" />;
}

export default VolumeIcon;