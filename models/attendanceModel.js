import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Employee from "./employeeModel.js";

const Attendance = sequelize.define(
  "attendance",
  {
    attendance_id: {
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Present", "Absent", "Late", "On Leave"),
      allowNull: false,
    },
  },
  {
    tableName: "attendance",
    timestamps: true,
  }
);

// Define the association
Attendance.belongsTo(Employee, {
  foreignKey: "employee_id", 
  targetKey: "employee_id", 
});

export default Attendance;
