const { string } = require('joi');

const user_details = require('../../model/user_details').userDetailHolder;

/**
 * @api {post} /getUsersList List of Registered Users
 * @apiSampleRequest http://localhost:3005/web/v1/getUsersList
 * @apiHeader {String} Authorization='bearer bd970a05-0ec1-4412-8b28-657962f0f778'
 * @apiName UsersList
 * @apiGroup Users
 *
 * @apiBody {String} page Get Page Wise Data.
 * @apiBody {String} word Get Searched Data.
 * 
 * @apiSuccessExample Successful Response:
 * HTTP/1.1 200 OK
 * 
 * {
 *   "status": 200,
 *   "data": [
 *      {
            "email": "johnDoe@gmail.com",
            "first_name": "john",
            "last_name": "doe",
            "is_deleted": false,
            "created_at": "2023-12-20T13:17:34.753Z",
            "roleName": "Admin",
            "accessModules": [
                "user Module",
                "customer personal data"
            ],
            "auth_id": "6582e96ea4213e590f473a9b"
        }
 *   ],
 *   "message": "Users list fetched successfully"
 * }
 * 
 */
module.exports.usersList = async (req, res) => {
    try {
        const { body } = req;
        const page = body.page ? Math.max(0, body.page) - 1 : 0;
        const limit = body.limit ? body.limit : 20
        const re = new RegExp(body.word, 'i');

        const users = await user_details.aggregate([
            {
                $lookup: {
                  from: 'roles', 
                  localField: 'role', 
                  foreignField: '_id',
                  as: 'role'
                }
            },
            {
                $match: {
                    "role.roleName": {
                        $ne: "Super Admin"
                    },
                    $or: [
                        { 'email': { $regex: re } },
                        { 'first_name': { $regex: re } },
                        { 'last_name': { $regex: re } },
                    ]
                }
            },
            { $sort: { created_at: -1 } },
            {
                $set: {
                  roleName: { $arrayElemAt: ['$role.roleName', 0] },
                  accessModules: { $arrayElemAt: ['$role.accessModules', 0] },
                  auth_id: '$_id',
                }
            },
            {
                $unset: ['_id', 'password', 'role']
            },
            {
                $facet: {
                    totalRecords: [
                        {
                            $count: "total"
                        }
                    ],
                    data: [
                        { $skip: limit * page },
                        { $limit: limit }
                    ]
                }
            },
            {
                $set: {
                    auth_id: '$_id',
                }
            },
            
        ])
        const total = users[0].totalRecords.length == 0 ? 0 : users[0].totalRecords[0].total
        res.sendSuccess({ total, data: users[0].data }, "Users list fetched successfully")
    }
    catch (error) {
        res.sendError(error.message);
    }
}

/**
 * @api {post} /userEdit Edit Users's Detail
 * @apiSampleRequest http://localhost:3005/web/v1/userEdit
 * @apiHeader {String} Authorization='bearer bd970a05-0ec1-4412-8b28-657962f0f778'
 * @apiName UserEdit
 * @apiGroup Users
 *
 * @apiBody {String} auth_id Users's Auth Id.
 * @apiBody {String} email Users's unique Email.
 * @apiBody {String} first_name Users's First Name.
 * @apiBody {String} last_name Users's Last Name.
 * @apiBody {String} role Users's role.
 * 
 * @apiSuccessExample Successful Response:
 * HTTP/1.1 200 OK
 * 
 * {
 *   "status": 200,
 *   "data": {},
 *   "message": "User edited successfully"
 * }
 * 
 */

module.exports.userEdit = async (req, res) => {
    try {
        const { body } = req;
        console.log("body",body);
        const users = await user_details.findOneAndUpdate({ _id: body.auth_id }, { $set: body })
        if (users) {
            if (JSON.parse(body.is_deleted || false)) {
                res.sendSuccess({}, 'User deleted successfully')
                return false;
            }
            res.sendSuccess({}, 'User edited successfully')
        }
        else {
            res.sendError('User not updated')
        }
    }
    catch (error) {
        res.sendError(error.message);
    }
}

module.exports.checkAccess = async (req, res) => {
    try {
        const { userId, moduleName } = req.params;
    
        const user = await user_details.findById(userId).populate('role', 'accessModules');
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Check if the user's role has access to the specified module
        const hasAccess = user.role.accessModules.includes(moduleName);
    
        res.json({ hasAccess });
    } catch (error) {
        res.sendError(error.message);
    }
}

module.exports.updateManyUsersSameData = async (req, res) => {
    try {
      
      const result = await user_details.updateMany({}, { $set: { last_name: req.body.lastName } });
      res.sendSuccess({updatedCount: result.modifiedCount}, 'Data edited successfully')

    } catch (error) {
        res.sendError(error.message);
    }
  };

  module.exports.updateManyUsersDifferentData = async (req, res) => {
    try {
        const updates = req.body;
    
        // Use a loop or Promise.all to update multiple users with different data
        const updatePromises = updates.map(async (update) => {
          const { userId, dataToUpdate } = update;
          return user_details.findByIdAndUpdate(userId, { $set: dataToUpdate }, { new: true });
        });
    
        const updatedUsers = await Promise.all(updatePromises);
    
        res.sendSuccess({ updatedUsers }, "Data updated successfully");
      } catch (error) {
        res.sendError(error.message);
    }
  };


