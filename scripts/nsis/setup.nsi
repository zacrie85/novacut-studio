; NOVACUT Studio - Windows Installer (NSIS)
; Kompilasi: NSISDIR=<nsis-data> makensis setup.nsi
;
; INSTALASI PER-USER — TANPA IZIN ADMINISTRATOR:
; - RequestExecutionLevel user  : installer tidak meminta password admin (tanpa UAC)
; - Dipasang ke $LOCALAPPDATA\Programs (folder milik user, seperti Chrome/VS Code)
; - Pintasan & registry ditulis ke HKCU (hanya milik user ini)

Unicode true
!define APPNAME "NOVACUT Studio"
!define COMPANY "NOVACUT"
!define VERSION "1.0.19"
!define EXENAME "NOVACUT Studio.exe"
!define UNINSTKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\NOVACUTStudio"

VIProductVersion "1.0.19.0"
VIAddVersionKey /LANG=1033 "ProductName" "NOVACUT Studio"
VIAddVersionKey /LANG=1033 "FileDescription" "NOVACUT Studio Installer"
VIAddVersionKey /LANG=1033 "FileVersion" "${VERSION}.0"
VIAddVersionKey /LANG=1033 "ProductVersion" "${VERSION}.0"
VIAddVersionKey /LANG=1033 "LegalCopyright" "Copyright 2026 NOVACUT Studio"

Name "${APPNAME} ${VERSION}"
OutFile "/home/z/my-project/release/NOVACUT-Studio-Setup-${VERSION}.exe"
InstallDir "$LOCALAPPDATA\Programs\${APPNAME}"
InstallDirRegKey HKCU "${UNINSTKEY}" "InstallLocation"
RequestExecutionLevel user
SetCompressor /SOLID lzma

!include "MUI2.nsh"
!include "FileFunc.nsh"

!define MUI_ICON "/home/z/my-project/build/icon.ico"
!define MUI_UNICON "/home/z/my-project/build/icon.ico"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\${EXENAME}"
!define MUI_FINISHPAGE_RUN_TEXT "Jalankan ${APPNAME} sekarang"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Indonesian"
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetShellVarContext current
  SetOutPath "$INSTDIR"
  File /r "/home/z/my-project/release/win-unpacked\*.*"

  ; shortcut desktop + start menu (milik user ini saja, tanpa admin)
  CreateDirectory "$SMPROGRAMS\${APPNAME}"
  CreateShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\${EXENAME}" "" "$INSTDIR\${EXENAME}" 0
  CreateShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\${EXENAME}" "" "$INSTDIR\${EXENAME}" 0
  CreateShortCut "$SMPROGRAMS\${APPNAME}\Uninstall ${APPNAME}.lnk" "$INSTDIR\Uninstall ${APPNAME}.exe"

  ; uninstaller
  WriteUninstaller "$INSTDIR\Uninstall ${APPNAME}.exe"

  ; registry Add/Remove Programs — HKCU (tidak butuh izin admin)
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayName" "${APPNAME} ${VERSION}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINSTKEY}" "Publisher" "${COMPANY}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayIcon" "$INSTDIR\${EXENAME}"
  WriteRegStr HKCU "${UNINSTKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTKEY}" "UninstallString" "$INSTDIR\Uninstall ${APPNAME}.exe"
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoModify" 0x00000001
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoRepair" 0x00000001

  ; estimasi ukuran instalasi (KB)
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKCU "${UNINSTKEY}" "EstimatedSize" "$0"
SectionEnd

Section "Uninstall"
  SetShellVarContext current
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\${APPNAME}.lnk"
  RMDir /r "$SMPROGRAMS\${APPNAME}"
  DeleteRegKey HKCU "${UNINSTKEY}"
SectionEnd
