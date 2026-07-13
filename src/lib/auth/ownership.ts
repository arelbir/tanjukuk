export type OwnableFileType = 'case_file' | 'enforcement_file'

export interface OwnableFileResource {
  id: string
  type?: OwnableFileType
  lawyer_id?: string | null
}

export interface OwnershipResult {
  isResponsibleLawyer: boolean
  reason?: string
}

export function resolveLawyerOwnership(userId: string, file: OwnableFileResource | null | undefined): OwnershipResult {
  if (!file) {
    return { isResponsibleLawyer: false, reason: 'Dosya bulunamadı' }
  }

  if (!('lawyer_id' in file)) {
    return { isResponsibleLawyer: false, reason: 'Dosyada sorumlu avukat alanı yok' }
  }

  if (!file.lawyer_id) {
    return { isResponsibleLawyer: false, reason: 'Dosyada sorumlu avukat atanmamış' }
  }

  return {
    isResponsibleLawyer: file.lawyer_id === userId,
    reason: file.lawyer_id === userId ? undefined : 'Kullanıcı bu dosyanın sorumlu avukatı değil',
  }
}

export function isResponsibleLawyer(userId: string, file: OwnableFileResource | null | undefined) {
  return resolveLawyerOwnership(userId, file).isResponsibleLawyer
}

export function toOwnershipPermissionResource(userId: string, file: OwnableFileResource | null | undefined) {
  return {
    isResponsibleLawyer: isResponsibleLawyer(userId, file),
    ownerUserId: file?.lawyer_id || null,
  }
}
