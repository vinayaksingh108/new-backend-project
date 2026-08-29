

/*method run kab ho koi na koi url jab hit. hoga tab method run hoga 
ushke liye routs hai */
import {Router} from "express";
import { loginUser, logOutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from"../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { refreshAccessToken } from "../controllers/user.controller.js";
const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar", // <--- Postman key MUST be exactly this
            maxCount: 1
        }, 
        {
            name: "coverImage", // <--- Postman key MUST be exactly this
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJWT,logOutUser)
router.route("/refresh-token").post(refreshAccessToken)



export default router;
