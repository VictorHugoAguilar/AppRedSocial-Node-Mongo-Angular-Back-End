'use-strict'

const path = require('path');
const fs = require('fs');
const momento = require('moment');
const mongoosePaginate = require('mongoose-paginate');

// Cargamos los controladores
const Publication = require('../models/publication.model');
const Follow = require('../models/follow.model');
const User = require('../models/user.model');