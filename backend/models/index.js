const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'connectnow.sqlite'),
  logging: false,
});

const User = require('./User')(sequelize, DataTypes);
const Post = require('./Post')(sequelize, DataTypes);
const Comment = require('./Comment')(sequelize, DataTypes);
const Follower = require('./Follower')(sequelize, DataTypes);

// Relationships

// User - Post (One-to-Many)
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// User - Comment (One-to-Many)
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Post - Comment (One-to-Many)
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// User - User (Follows, Many-to-Many through Follower)
User.belongsToMany(User, { through: Follower, as: 'followers', foreignKey: 'followingId' });
User.belongsToMany(User, { through: Follower, as: 'following', foreignKey: 'followerId' });

module.exports = { sequelize, User, Post, Comment, Follower };
