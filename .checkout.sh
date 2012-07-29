#!/bin/sh

git checkout master .gitignore
git checkout master README.md
git checkout master favicon.ico
git checkout master symbols_counter.html
mv symbols_counter.html index.html
git checkout master symbols_counter.css
git checkout master symbols_counter.js
