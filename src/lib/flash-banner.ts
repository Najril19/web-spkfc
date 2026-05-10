/** Query params untuk notifikasi halaman setelah redirect (simpan / hapus). */
export type FlashSearchParams = {
  success?: string;
  notice?: string;
  error?: string;
};


export function flashBanner(
  sp: FlashSearchParams,
  savedFallback = "Data berhasil disimpan.",
) {
  if (sp.error) {
    return { variant: "error" as const, text: sp.error };
  }
  if (sp.notice) {
    return { variant: "success" as const, text: sp.notice };
  }
  if (sp.success) {
    return { variant: "success" as const, text: savedFallback };
  }
  return null;
}
