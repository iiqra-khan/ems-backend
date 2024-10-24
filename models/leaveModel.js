import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Employee from "./employeeModel.js";

const Leave = sequelize.define(
  "leaves",
  {
    leave_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: "employees",
        key: "employee_id",
      },
    },
    leave_type: {
      type: DataTypes.ENUM("Earned leave", "Casual leave", "Sick leave"),
      allowNull: true,
      defaultValue: null,
    },
    day_type: {
      type: DataTypes.ENUM("Half Day", "Full Day"),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      allowNull: true,
      defaultValue: "Pending",
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "leaves",
    timestamps: true,
  }
);

// Define the association
Leave.belongsTo(Employee, {
  foreignKey: "employee_id", 
  targetKey: "employee_id",
});

export default Leave;
