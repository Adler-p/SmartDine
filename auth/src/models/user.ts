import { DataTypes, Model, Sequelize } from 'sequelize';
import { Password } from '../services/password';

export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff'
}

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  resetToken?: string | null; 
  resetTokenExpiry?: Date | null; 
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'resetToken' | 'resetTokenExpiry'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public name!: string;
  public resetToken!: string | null;
  public resetTokenExpiry!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    User.hasMany(models.RefreshToken, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'   // Delete refresh tokens when user is deleted
    })
  }
}

export const initUserModel = (sequelize: Sequelize) => {
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: User) => {
        const hashed = await Password.toHash(user.password);
        user.password = hashed;
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const hashed = await Password.toHash(user.password);
          user.password = hashed;
        }
      }
    },
    timestamps: true
  }); 

  return User; 
}
