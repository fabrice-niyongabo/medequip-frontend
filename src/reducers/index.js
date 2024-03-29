import {combineReducers} from 'redux';
import user from './user';
import devices from './devices';
import troubleShootingCategories from './troubleShootingCategories';
import deviceIssues from './deviceIssues';
import appUsers from './appUsers';
import db from './db';
import keywords from './keywords';
import messages from './messages';
import rooms from './rooms';
import spareparts from './spareparts';
import serialNumbers from './serialNumbers';
const rootReducer = combineReducers({
  user,
  devices,
  troubleShootingCategories,
  deviceIssues,
  appUsers,
  db,
  keywords,
  messages,
  rooms,
  spareparts,
  serialNumbers,
});

export default rootReducer;
