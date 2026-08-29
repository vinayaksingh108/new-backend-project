class ApiError extends Error{
    constructor(
        statusCode,
        message="Something wemt wrong",
        errors=[],
        stack=""//ye ek error stack hai bhai shab 
){
    super(message)
    this.statusCode=statusCode
    this.data=null
    this.message=message
    this.success=false;
    this.errors=this.errors

    if(stack){
        this.stack=stack;

    }
    else{ 
        Error.captureStackTrace(this,this.constructor)
    }

}


}
export {ApiError}