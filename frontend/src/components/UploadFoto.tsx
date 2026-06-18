import { useState, useRef } from 'react';

interface UploadFotoProps {
  atual: string;
  endpoint: string;
  campo: string;
  onUpload: (url: string) => void;
}

export default function UploadFoto({ atual, endpoint, campo, onUpload }: UploadFotoProps) {
  const [preview, setPreview] = useState(atual);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação do tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('⚠️ Apenas imagens são permitidas (JPG, PNG, GIF)');
      setTimeout(() => setError(''), 4000);
      return;
    }

    // Validação do tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('⚠️ Imagem deve ter no máximo 5MB');
      setTimeout(() => setError(''), 4000);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append(campo, file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const url = data.url || data.avatar || data[campo];

      if (!url) {
        throw new Error('URL da imagem não retornada pelo servidor');
      }

      setPreview(url);
      onUpload(url);
    } catch (err) {
      console.error('Erro no upload:', err);
      setError('❌ Falha ao fazer upload. Tente novamente.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  function handleClick() {
    if (!uploading) {
      inputRef.current?.click();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        onClick={handleClick}
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: uploading ? 'not-allowed' : 'pointer',
          border: '4px solid var(--brown-light)',
          background: '#f5f5f5',
          position: 'relative',
          opacity: uploading ? 0.6 : 1,
          transition: 'all 0.2s',
          boxShadow: uploading ? 'none' : '0 4px 6px rgba(0,0,0,0.1)',
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--brown)';
          }
        }}
        onMouseLeave={(e) => {
          if (!uploading) {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--brown-light)';
          }
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Foto de perfil"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={() => setPreview('')}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--brown-light) 0%, var(--brown) 100%)',
            color: '#fff',
            fontSize: 48,
          }}>
            👤
          </div>
        )}

        {/* Overlay de upload */}
        {uploading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8,
            color: '#fff',
          }}>
            <div style={{
              width: 32,
              height: 32,
              border: '3px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Enviando...</span>
          </div>
        )}

        {/* Overlay de hover */}
        {!uploading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 32,
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '0';
            }}
          >
            📷
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={uploading}
      />

      {error && (
        <p style={{
          color: '#dc2626',
          fontSize: 13,
          marginTop: 12,
          textAlign: 'center',
          padding: '8px 12px',
          background: '#fee2e2',
          borderRadius: 6,
          maxWidth: 240,
        }}>
          {error}
        </p>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}