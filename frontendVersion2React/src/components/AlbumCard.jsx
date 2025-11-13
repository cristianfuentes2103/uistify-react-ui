function AlbumCard({ album }) {
  return (
    <div className="album-card">
      <img src={album.cover} alt={`Portada de ${album.title}`} />
      <h4>{album.title}</h4>
      <p>{album.artists.join(', ')}</p>
    </div>
  );
}
export default AlbumCard;