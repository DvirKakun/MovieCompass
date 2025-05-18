from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.info("Validation error")
    errors = []
    for err in exc.errors():
        loc = err["loc"]
        if loc and loc[0] == "body":
            loc = loc[1:]
        field = ".".join(str(part) for part in loc)
        message = str(err["msg"])
       
        if "Value error," in message:
            message = message.replace("Value error,", "").strip()

        errors.append({"field": field, "message": message})

    return JSONResponse(
        status_code=HTTP_422_UNPROCESSABLE_ENTITY,
        content={"errors": errors}
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    logger.info("Http error")

    detail = exc.detail
    if isinstance(detail, dict) and "field" in detail and "message" in detail:
        return JSONResponse(status_code=exc.status_code, content={"errors": [detail]})
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"errors": [{"message": str(detail)}]}
    )
