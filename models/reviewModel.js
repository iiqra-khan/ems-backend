import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Employee from "./employeeModel.js";

const Review = sequelize.define(
  "reviews",
  {
    review_id: {
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
    review_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 5,
      },
      defaultValue: null,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
  }
);

// Define the association
Review.belongsTo(Employee, {
  foreignKey: "employee_id",
  targetKey: "employee_id", 
});

export default Review;
