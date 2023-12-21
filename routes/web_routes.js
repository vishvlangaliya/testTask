const web_routes = require('express').Router();
const middlewares = require('../helper/middlewares');
const { validateUser } = require('../model/user_details')

/* controller */
const auth = require('../controller/web_controller/auth');
const userService = require('../controller/web_controller/userService')
const roleService = require('../controller/web_controller/roleService')
/* controller */

web_routes.post('/register', middlewares.validation(validateUser), auth.register);
web_routes.post('/login', auth.login);
web_routes.get('/getUsersList', middlewares.routeMiddleWares, userService.usersList);
web_routes.post('/editUser', middlewares.routeMiddleWares, userService.userEdit);
web_routes.post('/addNewRole', middlewares.routeMiddleWares, roleService.addRole);
web_routes.get('/getRolesList', middlewares.routeMiddleWares, roleService.rolesList);
web_routes.post('/editRole/:roleId', middlewares.routeMiddleWares, roleService.updateRole);
web_routes.post('/deleteRole/:roleId', middlewares.routeMiddleWares, roleService.deleteRole);
web_routes.get('/checkAccess/:userId/:moduleName', middlewares.routeMiddleWares, userService.checkAccess);
web_routes.put('/updateManyUsersSameData', middlewares.routeMiddleWares, userService.updateManyUsersSameData);
web_routes.put('/updateManyUsersDifferentData', middlewares.routeMiddleWares, userService.updateManyUsersDifferentData);

module.exports = web_routes;