#!/usr/bin/env bash

if helm &> /dev/null; then
  echo helm installed.
else 
  echo installing helm
fi
