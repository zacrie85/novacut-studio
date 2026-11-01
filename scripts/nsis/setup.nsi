; NOVACUT Studio - Windows Installer (NSIS)
; Kompilasi: NSISDIR=<nsis-data> makensis setup.nsi

Unicode true
!define APPNAME "NOVACUT Studio"
!define COMPANY "NOVACUT"
!define VERSION "1.0.2"
!define EXENAME "NOVACUT Studio.exe"
!define UNINSTKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\NOVACUTStudio"

VIProductVersion "1.0.2.0"
VIAddVersionKey /LANG=1033 "ProductName" "NOVACUT Studio"
VIAddVersionKey /LANG=1033 "FileDescription" "NOVACUT Studio Installer"
VIAddVersionKey /LANG=1033 "FileVersion" "1.0.2.0"
VIAddVersionKey /LANG=1033 "ProductVersion" "1.0.2.0"
VIAddVersionKey /LANG=1033 "LegalCopyright" "Copyright 2026 NOVACUT Studio"

Name "${APPNAME} ${VERSION}"
OutFile "/home/z/my-project/release/NOVACUT-Studio-Setup-${VERSION}.exe"
InstallDir "$PROGRAMFILES64\${APPNAME}"
InstallDirRegKey HKLM "${UNINSTKEY}" "InstallLocation"
RequestExecutionLevel admin
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
  SetShellVarContext all
  SetOutPath "$INSTDIR"
  File /r "/home/z/my-project/release/win-unpacked\*.*"

  ; shortcut desktop + start menu
  CreateDirectory "$SMPROGRAMS\${APPNAME}"
  CreateShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\${EXENAME}" "" "$INSTDIR\${EXENAME}" 0
  CreateShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\${EXENAME}" "" "$INSTDIR\${EXENAME}" 0
  CreateShortCut "$SMPROGRAMS\${APPNAME}\Uninstall ${APPNAME}.lnk" "$INSTDIR\Uninstall ${APPNAME}.exe"

  ; uninstaller
  WriteUninstaller "$INSTDIR\Uninstall ${APPNAME}.exe"

  ; registry Add/Remove Programs
  WriteRegStr HKLM "${UNINSTKEY}" "DisplayName" "${APPNAME} ${VERSION}"
  WriteRegStr HKLM "${UNINSTKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "${UNINSTKEY}" "Publisher" "${COMPANY}"
  WriteRegStr HKLM "${UNINSTKEY}" "DisplayIcon" "$INSTDIR\${EXENAME}"
  WriteRegStr HKLM "${UNINSTKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "${UNINSTKEY}" "UninstallString" "$INSTDIR\Uninstall ${APPNAME}.exe"
  WriteRegDWORD HKLM "${UNINSTKEY}" "NoModify" 0x00000001
  WriteRegDWORD HKLM "${UNINSTKEY}" "NoRepair" 0x00000001

  ; estimasi ukuran instalasi (KB)
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKLM "${UNINSTKEY}" "EstimatedSize" "$0"
SectionEnd

Section "Uninstall"
  SetShellVarContext all
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\${APPNAME}.lnk"
  RMDir /r "$SMPROGRAMS\${APPNAME}"
  DeleteRegKey HKLM "${UNINSTKEY}"
SectionEnd
