import { Sequelize } from 'sequelize-typescript';
import { config } from './config/config.js';
import { Trade } from './models/trade.js'

const c = config.dev;

// Instantiate new Sequelize instance!
export const sequelize = new Sequelize({
  "username": c.username,
  "password": c.password,
  "database": c.database,
  "host":     c.host,

  dialect: 'postgres',
  storage: ':memory:',
});

export async function syncModels() {
  sequelize.addModels([Trade])
  //await sequelize.sync({ force: true });
  await sequelize.sync();
}