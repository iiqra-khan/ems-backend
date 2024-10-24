import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Employee = sequelize.define(
  "employees",
  {
    employee_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    job_role: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    join_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "employees",
    timestamps: true,
  }
);

export default Employee;
