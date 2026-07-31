module.exports = (sequelize, DataTypes) => {
  const Follower = sequelize.define('Follower', {
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    }
  }, {
    timestamps: false
  });
  return Follower;
};
