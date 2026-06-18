import { useEffect, useState } from 'react';

const ESTADOS = [
  { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' }, { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' }, { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' }, { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' }, { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

interface Props {
  estado: string;
  cidade: string;
  onEstadoChange: (v: string) => void;
  onCidadeChange: (v: string) => void;
  error?: { estado?: string; cidade?: string };
}

export default function EstadoCidadeSelect({ estado, cidade, onEstadoChange, onCidadeChange, error }: Props) {
  const [cidades, setCidades] = useState<string[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);

  useEffect(() => {
    if (!estado) { setCidades([]); return; }
    setLoadingCidades(true);
    const cod = ESTADOS.find(e => e.sigla === estado);
    if (!cod) { setLoadingCidades(false); return; }

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then((data: { nome: string }[]) => {
        setCidades(data.map(c => c.nome));
        setLoadingCidades(false);
      })
      .catch(() => { setCidades([]); setLoadingCidades(false); });
  }, [estado]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Estado</label>
        <select
          className="form-select"
          value={estado}
          onChange={e => { onEstadoChange(e.target.value); onCidadeChange(''); }}
        >
          <option value="">Selecione</option>
          {ESTADOS.map(e => (
            <option key={e.sigla} value={e.sigla}>{e.sigla} – {e.nome}</option>
          ))}
        </select>
        {error?.estado && <span style={{ color: '#dc2626', fontSize: 12 }}>{error.estado}</span>}
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Cidade</label>
        {cidades.length > 0 ? (
          <select className="form-select" value={cidade} onChange={e => onCidadeChange(e.target.value)}>
            <option value="">{loadingCidades ? 'Carregando...' : 'Selecione'}</option>
            {cidades.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <input
            className="form-input"
            type="text"
            placeholder={estado ? 'Digite a cidade' : 'Selecione o estado primeiro'}
            value={cidade}
            onChange={e => onCidadeChange(e.target.value)}
            disabled={!estado}
          />
        )}
        {error?.cidade && <span style={{ color: '#dc2626', fontSize: 12 }}>{error.cidade}</span>}
      </div>
    </div>
  );
}
