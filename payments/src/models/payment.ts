// import mongoose from 'mongoose';
// import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { PaymentStatus } from '@smartdine/common';
import { DataTypes, Model, Sequelize } from 'sequelize';

interface PaymentAttributes {
  paymentId: string;
  orderId: string;
  stripeChargeId?: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  sessionId: string;
  version?: number; 
}

interface PaymentCreationAttributes extends Omit<PaymentAttributes, 'paymentId'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public paymentId!: string;
  public orderId!: string;
  public stripeChargeId?: string;
  public amount!: number;
  public paymentStatus!: PaymentStatus;
  public paymentMethod?: string;
  public sessionId: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly version!: number; 
}

export const initPaymentModel = (sequelize: Sequelize) => {
  Payment.init(
    {
      paymentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      stripeChargeId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM(...Object.values(PaymentStatus)),
        allowNull: false,
        defaultValue: PaymentStatus.PENDING,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'payments',
      timestamps: true,
      version: 'version'    //TODO Need or not?
    }
  );
};

// paymentSchema.set('versionKey', 'version');
// paymentSchema.plugin(updateIfCurrentPlugin);

// paymentSchema.statics.build = (attrs: PaymentAttrs) => {
//   return new Payment(attrs);
// };

// const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

// export { Payment }; 