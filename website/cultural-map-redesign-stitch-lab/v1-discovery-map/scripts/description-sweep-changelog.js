#!/usr/bin/env node
// Prepends a changelog entry: node description-sweep-changelog.js "<title>" "<summary>"
const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', 'data', 'changelog.json');
const d = JSON.parse(fs.readFileSync(f, 'utf8'));
d.entries.unshift({ date: new Date().toISOString().slice(0, 10), title: process.argv[2], summary: process.argv[3], kind: 'improvement' });
fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
console.log('changelog +1:', process.argv[2]);
