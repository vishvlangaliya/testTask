const bcrypt = require('bcrypt');
/* model */
const user_details = require('../../model/user_details').userDetailHolder;
/* model */
const role = require('../../model/roles').Role;

const { generateJWTToken, sendMail, generatePassword } = require("../../helper/general_functions");

/**
 * @api {post} /userAdd Add New User
 * @apiSampleRequest http://localhost:3000/web/v1/userAdd
 * @apiHeader {String} Authorization='bearer bd970a05-0ec1-4412-8b28-657962f0f778'
 * @apiName AddUser
 * @apiGroup User
 *
 * @apiBody {String} email User's unique Email.
 * @apiBody {String} first_name User's First Name.
 * @apiBody {String} last_name User's Last Name.
 *
 * @apiSuccess {String} email Email of the User.
 * @apiSuccess {String} first_name Firstname of the User.
 * @apiSuccess {String} last_name  Lastname of the User.
 * 
 * @apiSuccessExample Successful Response:
 * HTTP/1.1 200 OK
 * 
 * {
 *    "status": 200,
 *    "data": {
 *        "email": "johnDoe@gmail.com",
 *        "first_name": "john",
 *        "last_name": "doe",
 *        "role": "employee",
 *        "created_at": "2023-12-21T14:01:52.424Z",
 *        "auth_id": "65844550bf4e3764eacb6d89"
 *    },
 *    "message": "Register successfully"
 * }
 * 
 */
module.exports.register = async (req, res) => {
    try {
        const { body } = req;
        const emailCheck = await user_details.findOne({ email: body.email });
        if (!emailCheck) {
            const user_details_status = await (new user_details({
                email: body.email,
                password: body.password,
                first_name: body.first_name,
                last_name: body.last_name,
                // role: body.role ? body.role : "user"
            })).save();
            if (user_details_status) {
                /*const mail = {
                    mail_file: 'registrationEmail.hbs',
                    to: body.email,
                    cc: [],
                    subject: 'Test user credential',
                    data: {
                        email: body.email,
                        password: body.password
                    }
                }
                await sendMail(mail) */

                // please enter your CLIENTID, CLIENTSECRET and ACCESSTOKEN to send email and uncomment the above code

                user_details_status._doc.auth_id = user_details_status._doc._id
                delete user_details_status._doc.password
                delete user_details_status._doc._id
                res.sendSuccess(user_details_status, 'Register successfully')
            }
            else {
                res.sendError('User details not store')
            }

        } else {
            res.sendError('Email already exists')
        }
    }
    catch (error) {
        res.sendError(error.message);
    }
}

/**
 * @api {post} /login Login Tool
 * @apiSampleRequest http://localhost:3000/web/v1/login

 * @apiName Login
 * @apiGroup Authentication
 *
 * @apiBody {String} email User's unique Email.
 * @apiBody {String} password User's Password.
 *
 * @apiSuccess {String} email Email of the User.
 * @apiSuccess {String} first_name Firstname of the User.
 * @apiSuccess {String} last_name  Lastname of the User.
 * 
 * @apiSuccessExample Successful Response:
 * HTTP/1.1 200 OK
 * 
 * {
 *   "status": 200,
 *   "data": {
 *       "email": "johnDoe@gmail.com",
        "first_name": "john",
        "last_name": "doe",
        "created_at": "2023-12-20T09:57:38.573Z",
        "role": "6582d3ed8655c2818b6f5f39",
        "is_deleted": false,
        "auth_id": "6582ba925d3c4cfa615fc2bd",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5Eb2VAZ21haWwuY29tIiwiaWF0IjoxNzAzMTY3NDAzLCJleHAiOjE3MDMyMTA2MDN9.H5KPf5qzz6KYfRiqgvOVcNZDLfy7Ztm4cVLVUor_eOM"
 *   },
 *   "message": "Login successfully"
 * }
 * 
 */

module.exports.login = async (req, res) => {
    try {
        const { body } = req;
        const userDetails = await user_details.findOne({ email: body.email });
        if (userDetails) {
            bcrypt.compare(body.password, userDetails.password, async (err, hash) => {
                if (err) {
                    res.sendError(err.message);
                    return false;
                }
                if (hash) {
                    if (userDetails) {
                        if (userDetails.is_deleted) {
                            res.sendError("Employee is deleted");
                            return false;
                        }

                        userDetails._doc.auth_id = userDetails._doc._id
                        delete userDetails._doc.password
                        delete userDetails._doc._id

                        const resObj = await {
                            ...userDetails._doc,
                            token: await generateJWTToken(userDetails),
                        }
                        res.sendSuccess(resObj, "Login successfully");
                    }
                    else {
                        res.sendError("Somthing went wrong");
                    }
                }
                else {
                    res.sendError("Your email or password was wrong");
                }
            })
        }
        else {
            res.sendError("your email or password was wrong");
        }
    }
    catch (error) {
        res.sendError(error.message);
    }
}
