import { DataTypes, Model, Sequelize } from 'sequelize';
import { User, UserAttributes } from './user';

interface RefreshTokenAttributes {
  id: string;
  token: string;
  userId: string;
  expiry: Date;
  revoked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User | UserAttributes; 
}

interface RefreshTokenCreationAttributes extends Omit<RefreshTokenAttributes, 'id' | 'createdAt' | 'updatedAt' | 'user'> {}

export class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
  public id!: string;
  public token!: string;
  public userId!: string;
  public expiry!: Date;
  public revoked!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public user?: User;

  static associate(models: any) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user' 
    });
  }
}

export const initRefreshTokenModel = (sequelize: Sequelize) => {
    RefreshToken.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        token: {
            type: DataTypes.STRING(512),
            allowNull: false,
            unique: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false, 
            references: {
                model: 'users', // Name of the target table
                key: 'id' // Key in the target table that we're referencing
            }, 
            onDelete: 'CASCADE' 
        },
        expiry: {
            type: DataTypes.DATE,
            allowNull: false
        },
        revoked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }, 
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
        }, 
        {
        sequelize,
        tableName: 'refresh_tokens',
        timestamps: true, // Enable timestamps for createdAt and updatedAt
    })
    return RefreshToken;
}