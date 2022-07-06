'use strict'

const mongoConfig = require('./configs/mongoConfig');
const app = require('./configs/app');

app.initServer();
mongoConfig.init();
