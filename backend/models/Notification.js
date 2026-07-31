module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    type: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., 'FOLLOW'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  return Notification;
};
