-- ==============================================================================
-- MIGRATION 0010: PENAMBAHAN ATRIBUT SIMOKP
-- Modul Sirkulasi Oplah (Eksemplar & Retur) & Skema Kerjasama Komersial
-- PT Kediri Intermedia Pers (Jawa Pos Radar Kediri)
-- ==============================================================================

ALTER TABLE public.marketing_activities 
  ADD COLUMN IF NOT EXISTS return_qty integer,
  ADD COLUMN IF NOT EXISTS sold_qty integer,
  ADD COLUMN IF NOT EXISTS return_condition text,
  ADD COLUMN IF NOT EXISTS edition_name text,
  ADD COLUMN IF NOT EXISTS partnership_type text,
  ADD COLUMN IF NOT EXISTS barter_type text,
  ADD COLUMN IF NOT EXISTS cash_value numeric default 0,
  ADD COLUMN IF NOT EXISTS barter_value numeric default 0,
  ADD COLUMN IF NOT EXISTS barter_desc text,
  ADD COLUMN IF NOT EXISTS realization_status text,
  ADD COLUMN IF NOT EXISTS proof_url text;

-- Keterangan Kolom Baru:
-- return_qty        : Jumlah eksemplar retur koran dari agen/loper
-- sold_qty          : Jumlah oplah bersih terjual (qty - return_qty)
-- return_condition  : Kondisi fisik eksemplar retur ('layak_stok' / 'rusak')
-- edition_name      : Nama edisi koran (misal: Reguler, Hari Guru, Hardiknas)
-- partnership_type  : Skema kerjasama ('murni_kas', 'barter', 'hybrid')
-- barter_type       : Objek barter ('barang', 'jasa', 'ruang_iklan')
-- cash_value        : Nilai penerimaan kas tunai masuk (Rp)
-- barter_value      : Nilai valuasi barter barang/jasa (Rp)
-- barter_desc       : Rincian barang/jasa barter
-- realization_status: Status realisasi kerjasama ('rencana', 'sebagian', 'selesai')
-- proof_url         : URL link atau path dokumen bukti fisik / MoU / nota
