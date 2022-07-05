'use strict'

const mongoConfig = require('./configs/mongoConfig');
const app = require('./configs/app');

mongoConfig.init();
app.initServer();