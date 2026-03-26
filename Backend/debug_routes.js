const express = require('express');
const app = require('./app'); // Assuming app.js exports app

console.log('--- Registered Routes ---');
function print(path, layer) {
    if (layer.route) {
        layer.route.stack.forEach(print.bind(null, path + layer.route.path));
    } else if (layer.name === 'router' && layer.handle.stack) {
        layer.handle.stack.forEach(print.bind(null, path + layer.regexp.source.replace('\\/?', '').replace('(?=\\/|$)', '')));
    } else if (layer.method) {
        console.log(`${layer.method.toUpperCase().padEnd(7)} ${path}`);
    }
}

app._router.stack.forEach(print.bind(null, ''));
process.exit(0);
