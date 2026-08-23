import './layar-status.css';

interface Props {
  pesan?: string;
}

/** Keadaan "memuat" untuk lapisan masuk (MASTER SPECIFICATION FINAL §13). */
export function LayarMemuat({ pesan = 'Menyiapkan aplikasi…' }: Props) {
  return (
    <div className="layar-status" role="status" aria-live="polite">
      <div className="layar-status__pemuat" aria-hidden="true" />
      <p className="layar-status__pesan">{pesan}</p>
    </div>
  );
}
