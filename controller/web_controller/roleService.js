const role = require('../../model/roles').Role;

module.exports.rolesList = async (req, res) => {
    try {
        const roles = await role.aggregate([
            {
                $project: {
                    roleName: 1,
                    accessModules: 1,
                    createdAt: 1,
                    active: 1,
                },
            },
        ])
        res.sendSuccess(roles, "role list fetched successfully")
    }
    catch (error) {
        res.sendError(error.message);
    }
}

module.exports.addRole = async (req, res) => {
    try {
        const { body } = req;
        const newRole = await (new role(body)).save();
        res.sendSuccess(newRole, "Role added successfully")
    }
    catch (error) {
        res.sendError(error.message);
    }
}

module.exports.updateRole = async (req, res) => {
    try {
      const { roleName, accessModules, active } = req.body;
  
      // Retrieve the existing role data
      const existingRoleData = await role.findById(req.params.roleId);
      if (!existingRoleData) {
        return res.sendError('Role not found');
      }
  
      // Ensure accessModules is an array
      const updatedAccessModules = Array.isArray(accessModules) ? [...new Set(accessModules)] : [];
  
      // Optionally remove one value from accessModules
      if (req.body.removeAccessModule) {
        const indexToRemove = updatedAccessModules.indexOf(req.body.removeAccessModule);
        if (indexToRemove !== -1) {
          updatedAccessModules.splice(indexToRemove, 1);
        }
      }
  
      // Update the role data
      const updateRoleData = await role.findByIdAndUpdate(
        req.params.roleId,
        { roleName, accessModules: updatedAccessModules, active },
        { new: true }
      );
  
      if (!updateRoleData) {
        return res.sendError('Role not found');
      }
  
      res.sendSuccess({}, 'Role updated successfully');
    } catch (error) {
      res.sendError(error.message);
    }
  };



module.exports.deleteRole = async (req, res) => {
    try {
        console.log("req.params.roleId",req.params.roleId);
        await role.findByIdAndDelete(req.params.roleId);
        res.sendSuccess({}, "Role deleted successfully")
    }
    catch (error) {
        res.sendError(error.message);
    }
}
