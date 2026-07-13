import type { UserContext } from '@/lib/auth'

export const demoUser: UserContext = {
  id: 'demo-admin',
  role: 'admin',
  fullName: 'Demo Yönetici',
  email: 'demo@hukuk.local',
  isActive: true,
}

export const lawyers = ['Av. Deniz Kaya', 'Av. Selin Arslan', 'Av. Mert Yılmaz']

export const files = [
  {
    id: 'case-1',
    type: 'case' as const,
    code: 'DVA-2026-014',
    client: 'Akdeniz Lojistik A.Ş.',
    counterparty: 'Kuzey Tedarik Ltd.',
    status: 'Duruşma bekliyor',
    responsible: 'Av. Deniz Kaya',
    nextAgenda: 'Bugün 14:30 ön inceleme',
    finance: '₺42.000 tahsilat bekleniyor',
    court: 'İstanbul 4. Asliye Ticaret',
    amount: '₺420.000',
  },
  {
    id: 'enf-1',
    type: 'enforcement' as const,
    code: 'ICR-2026-031',
    client: 'Yıldız İnşaat',
    counterparty: 'Murat Demir',
    status: 'Haciz hazırlığı',
    responsible: 'Av. Selin Arslan',
    nextAgenda: 'Yarın 10:00 UYAP kontrol',
    finance: '₺18.500 masraf',
    court: 'Bakırköy 7. İcra Dairesi',
    amount: '₺186.000',
  },
  {
    id: 'case-2',
    type: 'case' as const,
    code: 'DVA-2025-118',
    client: 'Mavi Teknoloji',
    counterparty: 'Eski Çalışan',
    status: 'Arşiv',
    responsible: 'Av. Mert Yılmaz',
    nextAgenda: 'Takip yok',
    finance: 'Kapandı',
    court: 'Ankara İş Mahkemesi',
    amount: '₺95.000',
  },
]

export const agenda = [
  { id: 'a1', date: 'Bugün', time: '09:30', type: 'Görev', title: 'Bilirkişi raporuna itiraz taslağı', file: 'DVA-2026-014', responsible: 'Av. Deniz Kaya', overdue: false },
  { id: 'a2', date: 'Bugün', time: '14:30', type: 'Duruşma', title: 'Ön inceleme duruşması', file: 'DVA-2026-014', responsible: 'Av. Deniz Kaya', overdue: false },
  { id: 'a3', date: 'Gecikmiş', time: 'Dün', type: 'Son tarih', title: 'Tebligat cevabı kontrolü', file: 'ICR-2026-031', responsible: 'Av. Selin Arslan', overdue: true },
]

export const financeItems = [
  { id: 'f1', kind: 'Alacak', amount: '₺42.000', client: 'Akdeniz Lojistik A.Ş.', file: 'DVA-2026-014', date: '15 Tem 2026', status: 'Bekliyor' },
  { id: 'f2', kind: 'Tahsilat', amount: '₺12.500', client: 'Yıldız İnşaat', file: 'ICR-2026-031', date: '11 Tem 2026', status: 'Alındı' },
  { id: 'f3', kind: 'Gider', amount: '₺2.850', client: 'Akdeniz Lojistik A.Ş.', file: 'DVA-2026-014', date: '10 Tem 2026', status: 'Masraf' },
]

export const documents = [
  { id: 'd1', name: 'Duruşma tutanağı.pdf', relation: 'DVA-2026-014', uploader: 'Av. Deniz Kaya', date: 'Bugün', size: '1.8 MB', finance: false },
  { id: 'd2', name: 'Tahsilat dekontu.pdf', relation: 'ICR-2026-031', uploader: 'Finans', date: 'Dün', size: '420 KB', finance: true },
  { id: 'd3', name: 'Vekaletname.jpg', relation: 'Akdeniz Lojistik A.Ş.', uploader: 'Demo Yönetici', date: '09 Tem', size: '2.2 MB', finance: false },
]

export const clients = [
  { id: 'c1', name: 'Akdeniz Lojistik A.Ş.', type: 'Tüzel kişi', contact: 'operasyon@akdeniz.test', activeFiles: 4 },
  { id: 'c2', name: 'Yıldız İnşaat', type: 'Tüzel kişi', contact: '+90 532 000 00 00', activeFiles: 2 },
  { id: 'c3', name: 'Murat Demir', type: 'Gerçek kişi', contact: 'murat@example.test', activeFiles: 1 },
]

export const notifications = [
  { id: 'n1', title: 'Bugünkü duruşma yaklaşıyor', description: 'DVA-2026-014 için 14:30 ön inceleme duruşması.', unread: true, group: 'Bugün' },
  { id: 'n2', title: 'Gecikmiş görev var', description: 'ICR-2026-031 tebligat cevabı kontrolü gecikti.', unread: true, group: 'Bugün' },
  { id: 'n3', title: 'Dekont yüklendi', description: 'Finans ekibi tahsilat dekontu ekledi.', unread: false, group: 'Önceki' },
]
