import { useRef } from 'react';
import AlbumCard from './AlbumCard'; 
function AlbumShelf({ albums }) {
  // useRef para obtener una referencia directa al div del grid y poder hacer scroll
  const gridRef = useRef(null);
  const scrollAmountFactor = 0.4;

  const handleScrollLeft = () => {
    if (gridRef.current) {
      const scrollAmount = gridRef.current.clientWidth * scrollAmountFactor;
      gridRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (gridRef.current) {
      const scrollAmount = gridRef.current.clientWidth * scrollAmountFactor;
      gridRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="album-shelf">
      <div ref={gridRef} className="album-grid">
        {albums.map(album => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
      
      {/* Botones de scroll */}
      <button onClick={handleScrollLeft} className="shelf-arrow-btn scroll-left-btn">
        <i className="icon-arrow-left"></i>
      </button>
      <button onClick={handleScrollRight} className="shelf-arrow-btn scroll-right-btn">
        <i className="icon-arrow-right"></i>
      </button>
    </section>
  );
}

export default AlbumShelf;