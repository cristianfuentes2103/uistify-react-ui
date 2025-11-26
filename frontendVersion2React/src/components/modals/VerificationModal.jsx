import { useModal } from '../../context/ModalContext';

function VerificationModal() {
  const { closeModal, modalView, modalData } = useModal();
  if (modalView !== 'verifyEmail') {
    return null;
  }

  // Obtenemos el email del usuario que se acaba de registrar, que pasaremos en modalData
  const userEmail = modalData?.email || 'tu correo electrónico';

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#0088ffff' }}>¡Revisa tu correo!</h2>
        <p style={{ margin: '24px 0', lineHeight: '1.6' }}>
          Hemos enviado un enlace de verificación a <strong style={{ fontSize: '0.9rem', color: '#00c3ffff' }}>{userEmail}</strong>.
          <br />
          Por favor, haz clic en el enlace para activar tu cuenta.
        </p>
        <p style={{ fontSize: '0.9rem', color: '#bcbcc7ff' }}>
          El enlace caduca en 5 minutos.
        </p>
        <button onClick={closeModal} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Entendido
        </button>
      </div>
    </div>
  );
}

export default VerificationModal;