#!/usr/bin/env bash
set -euo pipefail

export ANDROID_HOME="$HOME/Android/Sdk"
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
export PATH="$PATH:$ANDROID_HOME/platform-tools"

cd "$(dirname "$0")/.."

if ! adb devices | grep -q "device$"; then
  echo "No authorized Android device found. Plug in your phone, enable USB debugging, and approve the RSA prompt, then re-run this script." >&2
  exit 1
fi

npx expo run:android
