

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
router.route("/change-password").post(verifyJWt,changeCurrentpassword)
router.route("/currect-user").get(verifyJWT,getCurrUser)
router.route("/upadate-account-details").patch(verifyJWT,)//patch used agr post use krte toh sara det. update hojaayenge \
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/watch-history").get(verifyJWT,getWatchHistory)



export default router;
