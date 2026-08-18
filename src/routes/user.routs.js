

/*method run kab ho koi na koi url jab hit. hoga tab method run hoga 
ushke liye routs hai */
import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from"../middlewares/multer.middleware.js"
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





export default router;
