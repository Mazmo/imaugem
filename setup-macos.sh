#!/usr/bin/env bash
set -euo pipefail

# Prevent System Preferences from restoring windows on reopen
defaults write com.apple.systempreferences NSQuitAlwaysKeepsWindows -bool false
