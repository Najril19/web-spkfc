/** Forward chaining — same logic as PHP `pages/user/diagnosa.php` */

export type RelasiRow = {
  kode_penyakit: string;
  kode_gejala: string;
  nama_penyakit: string;
};

export type DiagnosisResult = {
  kode_penyakit: string;
  nama_penyakit: string;
  confidence: number;
  gejala_cocok: number;
  total_gejala: number;
};

export function computeDiagnosis(
  selectedGejala: string[],
  relasi: RelasiRow[],
): DiagnosisResult[] {
  const penyakit_gejala: Record<
    string,
    { nama: string; total_gejala: number; gejala_cocok: number }
  > = {};

  for (const r of relasi) {
    if (!penyakit_gejala[r.kode_penyakit]) {
      penyakit_gejala[r.kode_penyakit] = {
        nama: r.nama_penyakit,
        total_gejala: 0,
        gejala_cocok: 0,
      };
    }
    penyakit_gejala[r.kode_penyakit].total_gejala++;
  }

  for (const gejala_kode of selectedGejala) {
    for (const r of relasi) {
      if (r.kode_gejala === gejala_kode) {
        penyakit_gejala[r.kode_penyakit].gejala_cocok++;
      }
    }
  }

  const hasil: DiagnosisResult[] = Object.entries(penyakit_gejala).map(
    ([kode, data]) => ({
      kode_penyakit: kode,
      nama_penyakit: data.nama,
      confidence: data.total_gejala
        ? data.gejala_cocok / data.total_gejala
        : 0,
      gejala_cocok: data.gejala_cocok,
      total_gejala: data.total_gejala,
    }),
  );

  hasil.sort((a, b) => b.confidence - a.confidence);
  return hasil;
}
