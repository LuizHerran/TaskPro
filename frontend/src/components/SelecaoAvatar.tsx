import { useState } from 'react';

// Fotos pré-definidas do sistema (você pode adicionar mais)
const FOTOS_PRE_DEFINIDAS = [
  'https://i.pinimg.com/736x/d6/22/62/d622626725e83cdcbd5abe77e4d1f44b.jpg',
  'https://www.svgrepo.com/show/452030/avatar-default.svg',
  'https://static.vecteezy.com/ti/vetor-gratis/p1/26641311-martelo-e-serra-silhueta-marceneiro-ferramenta-icone-marcenaria-simbolo-vetor.jpg',
  'https://cdn-icons-png.flaticon.com/512/4794/4794939.png',
  'https://img.magnific.com/vetores-gratis/avatar-de-personagem-de-empresario-isolado_24877-60111.jpg?semt=ais_hybrid&w=740&q=80',
  'https://images.icon-icons.com/2643/PNG/512/female_woman_avatar_people_person_white_tone_icon_159370.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm6khwcQVea71OSRDqWljeBz8gyhQDba55DQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKKvJhQmlWaelt35ykpkaDosGm-y-Grnm9SQ&s'


];

interface SelecaoAvatarProps {
  avatarAtual?: string;
  onSelecionar: (avatarUrl: string) => void;
  onUpload?: (file: File) => void;
}

export default function SelecaoAvatar({ 
  avatarAtual, 
  onSelecionar,
  onUpload 
}: SelecaoAvatarProps) {
  const [abaAtiva, setAbaAtiva] = useState<'predefinidas' | 'upload'>('predefinidas');
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      
      if (onUpload) {
        onUpload(file);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      {/* Abas */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 20,
        borderBottom: '2px solid var(--border)',
        paddingBottom: 12,
      }}>
        <button
          onClick={() => setAbaAtiva('predefinidas')}
          style={{
            padding: '8px 16px',
            background: abaAtiva === 'predefinidas' ? 'var(--brown-light)' : 'transparent',
            color: abaAtiva === 'predefinidas' ? '#fff' : 'var(--brown)',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          📸 Escolher do Sistema
        </button>
        <button
          onClick={() => setAbaAtiva('upload')}
          style={{
            padding: '8px 16px',
            background: abaAtiva === 'upload' ? 'var(--brown-light)' : 'transparent',
            color: abaAtiva === 'upload' ? '#fff' : 'var(--brown)',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          📤 Enviar Foto
        </button>
      </div>

      {/* Aba: Fotos Pré-definidas */}
      {abaAtiva === 'predefinidas' && (
        <div>
          <p style={{ 
            fontSize: 13, 
            color: 'var(--text-muted)', 
            marginBottom: 16,
            textAlign: 'center',
          }}>
            Selecione uma das fotos abaixo:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}>
            {FOTOS_PRE_DEFINIDAS.map((foto, index) => (
              <div
                key={index}
                onClick={() => onSelecionar(foto)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: avatarAtual === foto ? '3px solid var(--brown-light)' : '2px solid var(--border)',
                  transition: 'all 0.2s',
                  opacity: avatarAtual === foto ? 1 : 0.8,
                }}
                onMouseEnter={(e) => {
                  if (avatarAtual !== foto) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--brown-light)';
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (avatarAtual !== foto) {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLElement).style.opacity = '0.8';
                  }
                }}
              >
                <img
                  src={foto}
                  alt={`Opção ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {avatarAtual === foto && (
                  <div style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: '#10b981',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba: Upload */}
      {abaAtiva === 'upload' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            fontSize: 13, 
            color: 'var(--text-muted)', 
            marginBottom: 20,
          }}>
            Envie sua própria foto (máx. 5MB)
          </p>
          
          {preview ? (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 16px',
                border: '4px solid var(--brown-light)',
              }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <p style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                ✅ Imagem selecionada com sucesso!
              </p>
            </div>
          ) : (
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: 12,
              padding: '40px 20px',
              marginBottom: 20,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onClick={() => document.getElementById('file-input')?.click()}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--brown-light)';
                (e.currentTarget as HTMLElement).style.background = '#fef3c7';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
              <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--brown)' }}>
                Clique para selecionar
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                ou arraste e solte aqui
              </p>
            </div>
          )}

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {preview && (
            <button
              onClick={() => {
                setPreview(null);
                const input = document.getElementById('file-input') as HTMLInputElement;
                if (input) input.value = '';
              }}
              style={{
                padding: '8px 16px',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✕ Remover foto
            </button>
          )}
        </div>
      )}
    </div>
  );
}