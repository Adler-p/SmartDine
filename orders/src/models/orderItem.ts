import { DataTypes, Model, Sequelize } from 'sequelize';

// Interface for OrderItem attributes
interface OrderItemAttributes {
    orderItemId: string;
    orderId: string;
    itemId: string;
    itemName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

// Interface for OrderItem Creation Attributes
interface OrderItemCreationAttributes extends Omit<OrderItemAttributes, 'orderItemId'> {}

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
    public orderItemId!: string;
    public orderId!: string;
    public itemId!: string;
    public itemName!: string;
    public unitPrice!: number;
    public quantity!: number;
    public subtotal!: number;

    // Timestamps (provided by Sequelize)
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export const initOrderItemModel = (sequelize: Sequelize) => {
    OrderItem.init(
        {
            orderItemId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            orderId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'orders', 
                    key: 'orderId'
                }
            },
            itemId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            itemName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            unitPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            subtotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            }
        },
        {
            sequelize,
            tableName: 'orderItems',
            timestamps: true
        }
    );

    return OrderItem;
}