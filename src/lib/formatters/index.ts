const tz = "Asia/Jakarta";
export const rupiah = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
export const num = (n: number | null | undefined, d = 0) =>
  n == null ? "—" : new Intl.NumberFormat("id-ID", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
export const pct = (n: number | null | undefined, d = 0) => (n == null ? "—" : `${num(n, d)}%`);
export const dateID = (iso: string | null | undefined) =>
  !iso ? "—" : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: tz }).format(new Date(iso));
export const dateTimeID = (iso: string | null | undefined) =>
  !iso ? "—" : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));
export const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
export const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu verifikasi", approved: "Disetujui", rejected: "Ditolak", revision: "Perlu revisi",
  deal: "Deal", no: "NO", active: "Aktif", closed: "Ditutup", draft: "Draf",
  berjalan: "Berjalan", rencana: "Rencana", selesai: "Selesai", open: "Berjalan",
};
export const TYPE_LABEL: Record<string, string> = {
  oplah: "Oplah", client: "List Client", program: "Program/Barter", profiling: "Riset Profiling",
  offer: "Penawaran", progress: "Progress", outcome: "Hasil Deal/NO",
};
export const ROLE_LABEL: Record<string, string> = { admin: "Super Admin", hrd: "Admin (HRD)", employee: "Pengguna (Karyawan)" };
export const SCOPE_LABEL: Record<string, string> = { company: "Perusahaan", division: "Divisi", individual: "Individu" };
export const ROLES_OPTIONS = Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }));
