/*

  Permissions.js

  This is the new Permission system for the bot. The goal is the ensure that the
  user can create and assign functions to roles, without touching code.

*/
var Permissions = function (opts) {
    this.roles = {};
    this.usersInRoles = {};
    this.users = {};
};

Permissions.prototype.userAllowedAccess = function (user, fnName) {
  var userObject = this.users[user];
  if (!userObject) return false;
  console.log(user);
  console.log(fnName);
  console.log(this.usersInRoles);
  console.log(this.users);
  console.log(this.roles);
  /*
    @TODO
    This function call has the potential to be a very expensive call as the
    the number of functions increase.
  */
  if (this.isPublicFunction(fnName)) return true;
  for (var i = 0 ; i < userObject.roles.length; i++) {
    if (this.roles[userObject.roles[i]].indexOf(fnName) > -1) {
    // fnName is inside the role pool that this user was assigned to;
      return true;
    }
  }
  return false;
};
Permissions.prototype.isPublicFunction = function(fnName) {
  for (var i = 0; i < this.roles["public"].length; i++)
    if (this.roles["public"][i] == fnName) return true;

  return false;
};
Permissions.prototype.addDefaultPermissions = function(cmdName, roleAuth) {
  // if permissions for this role hasn't been created yet, just create a
  // empty role set;
  if (!(this.roles[roleAuth])) this.roles[roleAuth] = [];
  // role exists, so just add the cmdName to the pool that roleAuth can
  // access.
  this.roles[roleAuth].push(cmdName);
};

Permissions.prototype.addUserToRole = function(userId, roleAuth) {
  if(!(this.usersInRoles[roleAuth])) this.usersInRoles[roleAuth] = [];
  this.usersInRoles[roleAuth].push(userId);
  this.users[userId].roles.push(roleAuth);
};

Permissions.prototype.addUserToPool = function(userId) {
  this.users[userId] = {
    roles: []
  };
};
module.exports = new Permissions();
