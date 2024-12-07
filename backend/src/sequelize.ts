import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { config } from './config/config.js';
import { Trade } from './models/trade.js'

const c = config.dev;

let seq: SequelizeOptions = {
  "username": c.username,
  "password": c.password,
  "database": c.database,
  "host":     c.host,

  dialect: 'postgres',
  storage: ':memory:'
};

if(c.postgres_disable_ssl === false)
{
  seq.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
   }
  };
}

// Instantiate new Sequelize instance!
export const sequelize = new Sequelize(seq);

export async function syncModels() {
  sequelize.addModels([Trade])
  // await sequelize.sync({ force: true });
  await sequelize.sync();
}