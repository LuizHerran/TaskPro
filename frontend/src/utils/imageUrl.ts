export function getAvatarUrl(avatar?: string): string {
  if (!avatar) return '';
  
  // Se já é URL absoluta (começa com http), retorna como está
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  // Se é URL relativa, adiciona o base URL do backend
  return `http://localhost:3001${avatar}`;
}