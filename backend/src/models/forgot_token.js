const { DataTypes } = require("sequelize");

const ForgotToken = (sequelize) => {
  return sequelize.define(
    "ForgotToken",
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      valid_until: {
        type: DataTypes.DATE,
        allowNull: false
      },
      is_valid: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
    }
  )
}

module.exports = ForgotToken;