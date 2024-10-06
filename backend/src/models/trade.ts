import { Table, Column, Model, AllowNull, Default, DataType, Length, Max } from 'sequelize-typescript';

@Table
export class Trade extends Model {
  @Length({ msg: 'Must be between 1 and 50 characters.', min: 1, max: 50 })
  @AllowNull(false)
  @Column(DataType.STRING(50))
  user_id!: string;

  @Length({ msg: 'Must be between 1 and 5 characters.', min: 1, max: 5 })
  @AllowNull(true)
  @Column(DataType.STRING(25))
  ticker!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  shares!: bigint;


  @Column(DataType.DECIMAL(17,5))
  price!: number;

  @Column
  time!: Date;

  @Column
  comments!: string;
}