; NOVACUT Studio - Windows Portable (NSIS silent launcher)
; Kompilasi: NSISDIR=<nsis-data> makensis portable.nsi

Unicode true
!define APPNAME "NOVACUT Studio"
!define VERSION "1.0.10"
!define EXENAME "NOVACUT Studio.exe"

VIProductVersion "1.0.9.0"
VIAddVersionKey /LANG=1033 "ProductName" "NOVACUT Studio Portable"
VIAddVersionKey /LANG=1033 "FileDescription" "NOVACUT Studio Portable"
VIAddVersionKey /LANG=1033 "FileVersion" "${VERSION}.0"
VIAddVersionKey /LANG=1033 "ProductVersion" "${VERSION}.0"
VIAddVersionKey /LANG=1033 "LegalCopyright" "Copyright 2026 NOVACUT Studio"

Name "${APPNAME} Portable"
OutFile "/home/z/my-project/release/NOVACUT-Studio-Portable-${VERSION}.exe"
Icon "/home/z/my-project/build/icon.ico"
SilentInstall silent
RequestExecutionLevel user
SetCompressor /SOLID lzma

Function .onInit
  ; tanpa dialog apa pun - langsung ekstrak & jalankan
FunctionEnd

Section "Portable"
  InitPluginsDir
  SetOutPath "$PLUGINSDIR\app"
  File /r "/home/z/my-project/release/win-unpacked\*.*"
  ExecWait '"$PLUGINSDIR\app\${EXENAME}"'
  SetOutPath "$TEMP"
SectionEnd
